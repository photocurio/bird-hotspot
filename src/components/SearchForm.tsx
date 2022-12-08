import { Dispatch, SetStateAction } from 'react'
import { viewType } from '../types'
type searchFormProps = {
	setViewState: Dispatch<SetStateAction<viewType>>,
	mapLoaded: boolean
}

import { useState, useEffect } from 'react'

function SearchForm({ setViewState, mapLoaded }: searchFormProps) {
	const [query, setQuery] = useState('')

	useEffect(() => {
		submitGeocoding()
	}, [])

	async function submitGeocoding() {
		if (!query) return
		const errorString: string = `Could not get location: ${query}`

		const res: Response = await fetch(`/.netlify/functions/geocoding/?q=${query}`)
		if (!res.ok) {
			return console.log(errorString)
		}

		const json = await res.json()

		if (
			!json.hasOwnProperty('features') || json.features.length === 0
		) return console.log(errorString)

		const coords = {
			longitude: json.features[0]['center'][0],
			latitude: json.features[0]['center'][1],
			zoom: 9.5
		}
		setViewState(coords)
	}

	if (!mapLoaded) return (
		<span>&nbsp;</span>
	)
	else return (
		<form
			className="input-group flex-grow-1 flex-sm-grow-0"
			role="search"
			onSubmit={e => {
				e.preventDefault()
				submitGeocoding()
			}}
		>
			<input
				className="form-control"
				type="search"
				size={30}
				placeholder="town or city, state"
				aria-label="Go to location"
				name="query"
				onChange={e => setQuery(e.target.value)}
				onBlur={e => setQuery(e.target.value)}
			/>
			<button className="btn btn-light" type="submit">Go</button>
		</form>
	)
}

export default SearchForm
