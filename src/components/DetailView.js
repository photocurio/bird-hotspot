import React, { useEffect, useState } from 'react'

export default function DetailView ( { hotspot, height, setSelectedMarker } ) {
	if ( !hotspot ) return

	const [hotspotDetail, setHotspotDetail] = useState( [] )

	useEffect( () => {
		getObservations()
	}, [hotspot] )

	async function getObservations () {
		if ( !hotspot.hasOwnProperty( 'locId' ) ) return setHotspotDetail( [] )
		const res = await fetch( `/.netlify/functions/observations/?locationCode=${hotspot.locId}&back=7` )
		const json = await res.json()
		setHotspotDetail( json )
	}

	return (
		<aside style={ { height: `${height}px` } }>
			<button className="close-info" onClick={ () => setSelectedMarker( {} ) }>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					fill="currentColor"
					className="bi bi-chevron-right"
					viewBox="0 0 16 16"
				>
					<path
						fillRule="evenodd"
						d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"
					/>
				</svg>
			</button>
			<h5>{ hotspot.locName }</h5>
			{ hotspotDetail.length ?
				'Observations, past 7 days:' :
				'No observations recorded in the past 7 days.'
			}
			<ul className="obs" >
				{ hotspotDetail.map( hs => {
					return <li key={ hs.speciesCode }>{ hs.comName }, { hs.howMany ? hs.howMany : 1 }</li>
				} ) }
			</ul>
		</aside >
	)
}
