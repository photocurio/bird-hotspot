import { useState, useEffect } from 'react'
import MapView from './components/MapView'
import SearchForm from './components/SearchForm'
import DetailView from './components/DetailView'
import AboutModal from './components/AboutModal'
import defaultLocations from './data/defaultLocations'
import flyingBird from './images/bird-flying.gif'

function getCoords () {
	return new Promise( ( resolve, reject ) => {
		navigator.geolocation.getCurrentPosition(
			pos => resolve( {
				longitude: pos.coords.longitude,
				latitude: pos.coords.latitude,
				zoom: 9.5
			} ),
			err => reject( err )
		)
	} )
}

// Random interger between 0 and 9.
// Used to pick one of ten default locations.
const int = Math.floor( Math.random() * 10 )

export default function App () {
	// Initialize viewState (map center position and zoom value) as null.
	// If viewState is null, the map will not render.
	const [viewState, setViewState] = useState( null )

	// if selectedMarker contains data, the detail tray will slide out
	const [selectedMarker, setSelectedMarker] = useState( {} )
	const [showDetail, setShowDetail] = useState( false )
	const [observations, setObservations] = useState( [] )
	const [noObservations, setNoObservations] = useState( false )
	const [mapLoaded, setMapLoaded] = useState( false )
	const [openModal, setOpenModal] = useState( false )

	// runs on initialization
	useEffect( () => {
		getPosition()
	}, [] )

	useEffect( () => {
		getObservations()
	}, [selectedMarker.locId] )

	// If tray closes, null the selected marker.
	useEffect( () => {
		if ( !showDetail ) setSelectedMarker( {} )
	}, [showDetail] )

	// Gets initial position from the browser. 
	// This function is called in a useEffect.
	// Uses a default position if the browser does not have permission.
	async function getPosition () {
		try {
			const coords = await getCoords()
			setViewState( coords )
		}
		catch ( err ) {
			console.log( err.message )
			setViewState( {
				longitude: defaultLocations[int][0],
				latitude: defaultLocations[int][1],
				zoom: 9.5
			} )
		}
	}

	async function getObservations () {
		setObservations( [] )
		if ( !selectedMarker.hasOwnProperty( 'locId' ) ) return
		const res = await fetch( `/.netlify/functions/observations/?locationCode=${selectedMarker.locId}&back=7` )
		if ( !res.ok ) return setNoObservations( true )
		const json = await res.json()
		setObservations( json )
		if ( !json.length ) setNoObservations( true )
		else setNoObservations( false )
		setShowDetail( true )
	}

	return (
		<>
			<header>
				<nav className="navbar navbar-expand-md navbar-dark bg-dark">
					<div className="container-fluid">
						<a className="navbar-brand" href="" onClick={ e => {
							e.preventDefault()
							setOpenModal( false )
						} }>Bird Hotspot</a>
						<ul className="navbar-nav me-auto">
							<li className="nav-item">
								<a className="nav-link" href="" onClick={ e => {
									e.preventDefault()
									setOpenModal( true )
								} }>About</a
								>
							</li>
						</ul>
						<SearchForm setViewState={ setViewState } mapLoaded={ mapLoaded } />
					</div>
				</nav>
			</header>
			<main id="main">
				<img
					src={ flyingBird }
					alt="bird flying"
					className={ mapLoaded ? 'bird-flying loaded' : 'bird-flying' }
				/>
				<MapView
					viewState={ viewState }
					setViewState={ setViewState }
					selectedMarker={ selectedMarker }
					setSelectedMarker={ setSelectedMarker }
					setMapLoaded={ setMapLoaded }
					openModal={ openModal }
				/>
				<DetailView
					showDetail={ showDetail }
					selectedMarker={ selectedMarker }
					observations={ observations }
					setShowDetail={ setShowDetail }
					noObservations={ noObservations }
				/>
			</main>
			<footer className="footer mt-auto py-3 px-2 bg-light">
				<p className="text-center text-muted mb-0">
					Made by <a href="https://petermumford.net/">Peter Mumford</a> with
					data from <a href="https://ebird.org/home">ebird</a>. Flying bird icon
					by <a href="https://www.fredsprinkle.com/">Fred Sprinkle</a>.
				</p>
			</footer>
			<AboutModal openModal={ openModal } setOpenModal={ setOpenModal } />
		</>
	)
}

