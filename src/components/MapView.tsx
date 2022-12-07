import { selectedMarkerType, viewType } from '../types'

type StateLookup = { [key: string]: string }

type MapViewProps = {
	viewState: viewType,
	setViewState: (viewState: viewType) => void,
	selectedMarker: selectedMarkerType,
	setSelectedMarker: (selectedMarker: selectedMarkerType) => void,
	setMapLoaded: (mapLoaded: boolean) => void,
	openModal: boolean
}

type MarkerType = {
	[key: string]: {
		geometry: {
			type: "Point",
			coordinates: [number, number]
		},
		type: 'Feature',
		properties: {
			locId: string,
			locName: string,
			countryCode: string,
			subnational1Code: string,
			subnational2Code: string
		}

	}[]
}

import { useState, useRef } from 'react'
import Map, { Layer, Source, NavigationControl, Marker, MapRef, LayerProps } from 'react-map-gl'
import { uniq, difference } from 'lodash'
import 'mapbox-gl/dist/mapbox-gl.css'

const mapboxApiKey = process.env.MAPBOX_TOKEN

const stateCodes: StateLookup = {
	'01': 'AL',
	'02': 'AK',
	'04': 'AZ',
	'05': 'AR',
	'06': 'CA',
	'08': 'CO',
	'09': 'CT',
	'10': 'DE',
	'11': 'DC',
	'12': 'FL',
	'13': 'GA',
	'15': 'HI',
	'16': 'ID',
	'17': 'IL',
	'18': 'IN',
	'19': 'IA',
	'20': 'KS',
	'21': 'KY',
	'22': 'LA',
	'23': 'ME',
	'24': 'MD',
	'25': 'MA',
	'26': 'MI',
	'27': 'MN',
	'28': 'MS',
	'29': 'MO',
	'30': 'MT',
	'31': 'NE',
	'32': 'NV',
	'33': 'NH',
	'34': 'NJ',
	'35': 'NM',
	'36': 'NY',
	'37': 'NC',
	'38': 'ND',
	'39': 'OH',
	'40': 'OK',
	'41': 'OR',
	'42': 'PA',
	'44': 'RI',
	'45': 'SC',
	'46': 'SD',
	'47': 'TN',
	'48': 'TX',
	'49': 'UT',
	'50': 'VT',
	'51': 'VA',
	'53': 'WA',
	'54': 'WV',
	'55': 'WI',
	'56': 'WY',
	'60': 'AS',
	'66': 'GU',
	'69': 'MP',
	'72': 'PR',
	'78': 'VI'
}

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


export default function MapView(props: MapViewProps) {
	const { viewState, setViewState, selectedMarker, setSelectedMarker, setMapLoaded, openModal } = props

	// TODO type this!!!
	const [markers, setMarkers] = useState<MarkerType>({})

	// Make a reference to the Map, so we can call map methods.
	// Used for map.queryRenderedFeatures
	const birdMap = useRef<MapRef>(null)

	// Gets an array of all counties visible on the map. If some counties are no longer present 
	// that had been there, delete those counties and thier markers.
	// If new counties are present, fetch the markers in those counties, and add them to state.
	async function redrawHotspots() {
		const countiesPresent: string[] = getCounties()
		if (countiesPresent.length > 20) {
			return alert('Unable to fetch all the birding hotspots. Try zooming in.')
		}
		const countiesToRemove: string[] = difference(Object.keys(markers), countiesPresent)
		const countiesToAdd: string[] = difference(countiesPresent, Object.keys(markers))

		if (countiesToRemove.length) {
			countiesToRemove.forEach((countyCode) => {
				removeHotspots(countyCode)
			})
		}

		if (countiesToAdd.length) {
			await Promise.all(
				countiesToAdd.map(async (countyCode) => {
					await getHotspots(countyCode)
				})
			)
		}
	}

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

	// Return an array of 5 digit county FIPS codes. 
	// These are the counties that are present on the visible portion of the map.
	function getCounties(): string[] {
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

	// Early return if viewState is falsey.
	if (!viewState) return <div></div>

	else return (
		<Map
			{...viewState}
			ref={birdMap}
			mapboxAccessToken={mapboxApiKey}
			mapStyle="mapbox://styles/mapbox/outdoors-v11"
			onLoad={() => setMapLoaded(true)}
			onSourceData={async e => {
				if (e.sourceId !== 'countySource' || !e.isSourceLoaded || !e.hasOwnProperty('tile')) return
				await redrawHotspots()
			}}
			onMoveEnd={async e => {
				await setViewState(e.viewState)
				await redrawHotspots()
			}}
		>
			<NavigationControl />
			{Object.values(markers).map(county => {
				return county.map(m => {
					return <Marker key={m.properties.locId}
						longitude={m.geometry.coordinates[0]}
						latitude={m.geometry.coordinates[1]}
						onClick={() => setSelectedMarker(m.properties)}
						style={{
							// The Marker component does not support the className attribute
							// So, we have to do this inline styles stuff.
							backgroundColor: m.properties.locId === selectedMarker.locId ? 'MediumOrchid' : '',
							borderWidth: m.properties.locId === selectedMarker.locId ? '1.5px' : '',
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
