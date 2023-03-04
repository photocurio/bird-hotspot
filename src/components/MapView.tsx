import { viewType, MarkerType, MapViewProps, StateLookup, CountiesType } from '../types'
import states from '../data/states'
import { useState, useRef, useEffect } from 'react'
import Map, { Layer, Source, NavigationControl, Marker, MapRef, LayerProps } from 'react-map-gl'
import { uniq, difference } from 'lodash'
import 'mapbox-gl/dist/mapbox-gl.css'

const mapboxApiKey = process.env.MAPBOX_TOKEN

const stateCodes: StateLookup = states

// Style definition for transparent county boundary layer.
const countyLayer: LayerProps = {
	id: 'countyLayer',
	type: 'fill',
	source: 'countySource',
	'source-layer': 'original',
	paint: {
		'fill-outline-color': 'rgba(0,0,0,0)',
		'fill-color': 'rgba(0,0,0,0)'
	}
}

function getCoords(): Promise<viewType> {
	const options = {
		enableHighAccuracy: false,
		timeout: 5000,
		maximumAge: Infinity
	}
	return new Promise((resolve, reject) => {
		navigator.geolocation.getCurrentPosition(
			position => resolve({
				longitude: position.coords.longitude,
				latitude: position.coords.latitude,
				zoom: 9.5
			}),
			error => reject(error),
			options
		)
	})
}

export default function MapView(props: MapViewProps) {
	const { viewState, setViewState, selectedMarker, setSelectedMarker, setMapLoaded, openModal } = props
	const [markers, setMarkers] = useState<MarkerType>({})
	const [counties, setCounties] = useState<CountiesType>([])

	// Make a reference to the Map, so we can call map methods.
	// Used for map.queryRenderedFeatures
	const birdMap = useRef<MapRef>(null)

	/* 
	 * Gets user's position from the browser. 
	*/
	async function goToGeolocation() {
		try {
			const coords = await getCoords()
			setViewState(coords)
		}
		// Are errors always typed as any?
		catch (err: any) {
			if (err.message) console.log(err.message)
			else console.log('Could not get the browser geographic position.')
		}
	}

	/*
	 * Gets an array of all counties visible on the map. If some counties are no longer present 
	 * that had been there, delete those counties and thier markers.
	 * If new counties are present, fetch the markers in those counties, and add them to state.
	 */
	function redrawHotspots() {
		const countiesPresent: CountiesType = getCounties()
		// Limit the number of counties to 20.
		countiesPresent.splice(20)
		setCounties(countiesPresent)
	}

	useEffect(() => {
		redrawHotspots()
	}, [viewState])

	useEffect(() => {
		const countiesToRemove: CountiesType = difference(Object.keys(markers), counties)
		const countiesToAdd: CountiesType = difference(counties, Object.keys(markers))
		const addCounties = async (countiesToAdd: CountiesType) => {
			await Promise.all(
				countiesToAdd.map(async (countyCode: string) => {
					await getHotspots(countyCode)
				})
			)
		}

		if (countiesToRemove.length) {
			countiesToRemove.forEach((countyCode) => {
				removeHotspots(countyCode)
			})
		}

		if (countiesToAdd.length) {
			addCounties(countiesToAdd)
		}
	}, [counties])

	// Gets the birding hotspots for a county from eBird. Uses a serverless function.
	// Hotspots are saved to state in an array in the markers object, keyed to the county code.
	async function getHotspots(countyCode: string) {
		if (markers.hasOwnProperty(countyCode)) return

		// convert the countyCode to an eBird regionCode 
		const countyThreeDigit = countyCode.slice(-3)
		const stateTwoDigit = countyCode.slice(0, 2)
		const stateTwoChar: string = stateCodes[stateTwoDigit]
		const regionCode = `US-${stateTwoChar}-${countyThreeDigit}`

		// fetch the hotspots for the region. These regions will all be counties.
		const res = await fetch(`/.netlify/functions/hotspots?regioncode=${regionCode}&back=7`)
		if (!res.ok) {
			console.log(`Error: ${res.status}, ${res.statusText}`)
		} else {
			const hotspots = await res.json()
			if (hotspots.length) {
				markers[countyCode] = hotspots
				setMarkers({ ...markers })
			}
		}
	}

	// Remove a countyCode and all hotspots it contains
	function removeHotspots(countyCode: string) {
		if (!markers.hasOwnProperty(countyCode)) return
		delete markers[countyCode]
		setMarkers({ ...markers })
	}

	/* 
	 * Return an array of 5 digit county FIPS codes. 
	 * These are the counties that are present on the visible portion of the map.
	 */
	function getCounties(): CountiesType {
		if (!birdMap.current) return ['map is not loaded']
		const countiesPresent = birdMap.current.queryRenderedFeatures({
			// @ts-ignore
			layers: ['countyLayer']
		})

		// We only want the FIPS code for each county.
		const countyCodes = countiesPresent.map(c => {
			return c.properties ? c.properties.FIPS.toString() : null
		})

		// Remove duplicates, sort, and return the counties.
		const uniqCounties = uniq(countyCodes)
		return uniqCounties.sort()
	}

	return (
		<Map
			{...viewState}
			ref={birdMap}
			mapboxAccessToken={mapboxApiKey}
			mapStyle="mapbox://styles/mapbox/outdoors-v11"
			onLoad={() => setMapLoaded(true)}
			// Handler for the sourceData event.
			onSourceData={e => {
				// This condition filters out the wrong events.
				if (e.sourceId !== 'countySource' || !e.isSourceLoaded || !e.hasOwnProperty('tile')) return
				// Draw the hotspots when the countySource is loaded and has a title.
				redrawHotspots()
			}}
			// Handler for moving the map.
			onMoveEnd={e => {
				const view = e.viewState
				setViewState({
					longitude: view.longitude,
					latitude: view.latitude,
					zoom: view.zoom
				})
			}}
		>
			<NavigationControl />
			<div className="mapboxgl-control-container">
				<div className="mapboxgl-ctrl-top-right location">
					<div className="mapboxgl-ctrl mapboxgl-ctrl-group">
						<button className="mapboxgl-ctrl-geolocate" onClick={goToGeolocation} aria-label="Find my location">
							<span className="mapboxgl-ctrl-icon" aria-hidden="true" title="Find my location"></span>
						</button>
					</div>
				</div>
			</div>
			{Object.values(markers).map(county => {
				return county.map(m => {
					return <Marker key={m.properties.locId}
						longitude={m.geometry.coordinates[0]}
						latitude={m.geometry.coordinates[1]}
						onClick={() => setSelectedMarker(m.properties)}
						// The Marker component does not support className so we have to use these inline styles.
						style={{
							backgroundColor: m.properties.locId === selectedMarker.locId ? 'MediumOrchid' : '',
							borderWidth: m.properties.locId === selectedMarker.locId ? '2px' : '',
							width: m.properties.locId === selectedMarker.locId ? '22px' : '',
							height: m.properties.locId === selectedMarker.locId ? '22px' : '',
							opacity: openModal ? 0 : 1
						}}
					><></></Marker>
				})
			})}
			<Source type="vector" url="mapbox://mapbox.82pkq93d" id="countySource">
				<Layer {...countyLayer} />
			</Source>
		</Map >
	)
}
