import { useState, useEffect } from 'react'
import MapView from './components/MapView'
import SearchForm from './components/SearchForm'
import DetailView from './components/DetailView'
import { MapProvider } from 'react-map-gl'
import defaultLocations from './data/defaultLocations'

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
	const [selectedMarker, setSelectedMarker] = useState( {} )

	// Get position fires just once, on load.
	useEffect( () => {
		getPosition()
	}, [] )

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

	return (
		<>
			<header>
				<nav className="navbar navbar-expand-md navbar-dark bg-dark">
					<div className="container-fluid">
						<a className="navbar-brand" href="#">Bird Hotspot</a>
						<ul className="navbar-nav me-auto">
							<li className="nav-item">
								<a className="nav-link" href="">About</a
								>
							</li>
						</ul>
						<SearchForm setViewState={ setViewState } />
					</div>
				</nav>
			</header>
			<main id="main">
				<MapProvider>
					<MapView
						viewState={ viewState }
						setViewState={ setViewState }
						selectedMarker={ selectedMarker }
						setSelectedMarker={ setSelectedMarker }
					/>
				</MapProvider>
				<DetailView
					hotspot={ selectedMarker }
					height="333"
					setSelectedMarker={ setSelectedMarker }
				/>
			</main>
			<footer className="footer mt-auto py-3 px-2 bg-light">
				<p className="text-center text-muted mb-0">
					Made by <a href="https://petermumford.net/">Peter Mumford</a> with
					data from <a href="https://ebird.org/home">ebird</a>. Flying bird icon
					by <a href="https://www.fredsprinkle.com/">Fred Sprinkle</a>.
				</p>
			</footer>
		</>
	)
}

