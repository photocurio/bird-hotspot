import { selectedMarkerType, viewType, observationsType } from './types'
import { useState, useEffect } from 'react'
import MapView from './components/MapView'
import SearchForm from './components/SearchForm'
import DetailView from './components/DetailView'
import AboutModal from './components/AboutModal'
import defaultLocations from './data/defaultLocations'
import flyingBird from './images/flying-bird.gif'

function getCoords(): Promise<viewType> {
	return new Promise((resolve, reject) => {
		navigator.geolocation.getCurrentPosition(
			position => resolve({
				longitude: position.coords.longitude,
				latitude: position.coords.latitude,
				zoom: 9.5
			}),
			error => reject(error)
		)
	})
}

export default function App() {
	// Initialize viewState (map center position and zoom value) as null.
	// If viewState is null, the map will not render.
	const [viewState, setViewState] = useState<viewType>(null)

	// if selectedMarker contains data, the detail tray will slide out.
	const [selectedMarker, setSelectedMarker] = useState<selectedMarkerType>({ locId: '', locName: '' })
	const [showDetail, setShowDetail] = useState(false)
	const [observations, setObservations] = useState<observationsType[]>([])
	const [noObservations, setNoObservations] = useState(false)
	const [mapLoaded, setMapLoaded] = useState(false)
	const [openModal, setOpenModal] = useState(false)

	// Get initial position.
	useEffect(() => {
		getPosition()
	}, [])

	// If the selectedMarker changes, fetch any observations.
	useEffect(() => {
		getObservations()
	}, [selectedMarker.locId])

	/* 
	 * If tray closes, the selected marker is set to empty strings.
	 */
	useEffect(() => {
		if (!showDetail) setSelectedMarker({ locId: '', locName: '' })
	}, [showDetail])

	/* 
	 * Gets initial position from the browser. 
	 * This function is called in a useEffect.
	 * Uses a default position if the browser does not have permission.
	*/
	async function getPosition() {
		try {
			const coords = await getCoords()
			setViewState(coords)
		}
		// Are errors always typed as any?
		catch (err: any) {
			if (err.message) console.log(err.message)
			else console.log('Could not get the browser geographic position.')
			// Create random interger.
			// Used to pick one of ten default locations.
			// Default zoom is always 9.5
			const int = Math.floor(Math.random() * 10)
			setViewState({
				longitude: defaultLocations[int][0],
				latitude: defaultLocations[int][1],
				zoom: 9.5
			})
		}
	}

	/*
	 * Gets observations for a given hotspot ID.
	 * noObservations and showDetail are separate booleans
	 * because occaisionally a hotspot can have data but no observations.
	 */
	async function getObservations() {
		setObservations([])
		if (!selectedMarker.locId) return
		const res = await fetch(`/.netlify/functions/observations/?locationCode=${selectedMarker.locId}&back=7`)
		if (!res.ok) return setNoObservations(true)
		const json = await res.json()
		setObservations(json)
		if (!json.length) setNoObservations(true)
		else setNoObservations(false)
		setShowDetail(true)
	}

	return (
		<>
			<header>
				<nav className="navbar navbar-expand-md navbar-dark bg-dark">
					<div className="container-fluid">
						<a className="navbar-brand" href="" onClick={e => {
							e.preventDefault()
							setOpenModal(false)
						}}>Bird Hotspot</a>
						<ul className="navbar-nav me-auto">
							<li className="nav-item">
								<a className="nav-link" href="" onClick={e => {
									e.preventDefault()
									setOpenModal(true)
								}}>About</a
								>
							</li>
						</ul>
						<SearchForm setViewState={setViewState} mapLoaded={mapLoaded} />
					</div>
				</nav>
			</header>
			<main id="main">
				<img
					src={flyingBird}
					alt="bird flying"
					className={mapLoaded ? 'bird-flying loaded' : 'bird-flying'}
				/>
				<MapView
					viewState={viewState}
					setViewState={setViewState}
					selectedMarker={selectedMarker}
					setSelectedMarker={setSelectedMarker}
					setMapLoaded={setMapLoaded}
					openModal={openModal}
				/>
				<DetailView
					showDetail={showDetail}
					selectedMarker={selectedMarker}
					observations={observations}
					setShowDetail={setShowDetail}
					noObservations={noObservations}
				/>
			</main>
			<footer className="footer mt-auto py-3 px-2 bg-light">
				<p className="text-center text-muted mb-0">
					Made by <a href="https://petermumford.net/">Peter Mumford</a> with
					data from <a href="https://ebird.org/home">ebird</a>. Flying bird icon
					by <a href="https://www.fredsprinkle.com/">Fred Sprinkle</a>.
				</p>
			</footer>
			<AboutModal openModal={openModal} setOpenModal={setOpenModal} />
		</>
	)
}

