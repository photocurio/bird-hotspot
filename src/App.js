import React from 'react'
import MapView from './components/MapView'
import { MapProvider } from 'react-map-gl'

export default function App () {
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
						<form className="d-flex flex-grow-1 flex-sm-grow-0" role="search">
							<input
								className="form-control me-2"
								type="search"
								size="30"
								placeholder="town or city, state"
								aria-label="Search"
								name="query"
							/>
							<button className="btn btn-outline-light" type="submit">Go</button>
						</form>
					</div>
				</nav>
			</header>
			<main id="main">
				<MapProvider>
					<MapView />
				</MapProvider>
			</main>
			<footer className="footer mt-auto py-3 px-2 bg-light">
				<p className="text-center text-muted mb-0">
					Made by <a href="https://petermumford.net/">Peter Mumford</a> with data from <a
						href="https://ebird.org/home">ebird</a>. Flying bird icon by <a
							href="https://www.fredsprinkle.com/">Fred Sprinkle</a>.
				</p>
			</footer>
		</>
	)
}

