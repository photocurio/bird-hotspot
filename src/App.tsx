import { selectedMarkerType, viewType, observationsType } from './types'
import { useState, useEffect } from 'react'
import MapView from './components/MapView'
import SearchForm from './components/SearchForm'
import Aside from './components/Aside'
import AboutModal from './components/AboutModal'
import defaultLocations from './data/defaultLocations'
import flyingBird from './images/flying-bird.gif'

/*
 * Get a random location to initialize the map.
 */
function randomLocation() {
	const int = Math.floor(Math.random() * 10)
	return {
		longitude: defaultLocations[int][0],
		latitude: defaultLocations[int][1],
		zoom: 9.5
	}
}

export default function App() {
	/* 
	 * Initialize viewState with a random location.
	 */
	const [viewState, setViewState] = useState<viewType>(randomLocation)

	/*
	 * If selectedMarker contains data, the detail tray will slide out.
	 */
	const [selectedMarker, setSelectedMarker] = useState<selectedMarkerType>({ locId: '', locName: '' })
	const [showDetail, setShowDetail] = useState(false)
	const [observations, setObservations] = useState<observationsType[]>([])
	const [noObservations, setNoObservations] = useState(false)
	const [mapLoaded, setMapLoaded] = useState(false)
	const [openModal, setOpenModal] = useState(false)


	/*
	 * If the selectedMarker changes, fetch any observations.
	 */
	useEffect(() => {
		if (!selectedMarker.locId) return setShowDetail(false)
		else {
			getObservations()
			setShowDetail(true)
		}
	}, [selectedMarker.locId])

	/* 
	 * If tray closes, the selected marker is set to empty strings.
	 */
	useEffect(() => {
		if (!showDetail) {
			setSelectedMarker({ locId: '', locName: '' })
			setObservations([])
		}
	}, [showDetail])


	/*
	 * Gets observations for a given hotspot ID.
	 * noObservations and showDetail are separate booleans
	 * because occaisionally a hotspot can have data but no observations.
	 */
	async function getObservations() {
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
						<a className="nav-link" href="" onClick={e => {
							e.preventDefault()
							setOpenModal(true)
						}}>About</a
						>
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
				<Aside
					/*
					 * The detail tray that slides in when a hotspot is selected.
					 */
					showDetail={showDetail}
					selectedMarker={selectedMarker}
					observations={observations}
					setShowDetail={setShowDetail}
					noObservations={noObservations}
				/>
			</main>
			<footer className="footer mt-auto py-3 px-2 bg-dark">
				<p className="text-center text-light mb-0">
					Made by <a href="https://petermumford.net/">Peter Mumford</a> with
					data from <a href="https://ebird.org/home">ebird</a>. Flying bird icon
					by <a href="https://www.fredsprinkle.com/">Fred Sprinkle</a>.
				</p>
			</footer>
			<AboutModal openModal={openModal} setOpenModal={setOpenModal} />
		</>
	)
}

