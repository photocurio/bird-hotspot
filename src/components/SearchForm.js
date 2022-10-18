import React, { useState, useEffect } from 'react'

function SearchForm ( { setViewState } ) {
	const [query, setQuery] = useState( '' )
	useEffect( () => {
		submitGeocoding()
	}, [] )

	async function submitGeocoding () {
		if ( !query ) return
		const res = await fetch( `/.netlify/functions/geocoding/?q=${query}` )
		const json = await res.json()
		const coords = {
			longitude: json.address.lng,
			latitude: json.address.lat,
			zoom: 9.5
		}
		setViewState( coords )
	}
	return (
		<form
			className="d-flex flex-grow-1 flex-sm-grow-0"
			role="search"
			onSubmit={ e => {
				e.preventDefault()
				submitGeocoding()
			} }
		>
			<input
				className="form-control me-2"
				type="search"
				size="30"
				placeholder="town or city, state"
				aria-label="Search"
				name="query"
				onChange={ e => {
					setQuery( e.target.value )
				} }
				onBlur={ e => {
					setQuery( e.target.value )
				} }
			/>
			<button className="btn btn-outline-light" type="submit">Go</button>
		</form>
	)
}

export default SearchForm
