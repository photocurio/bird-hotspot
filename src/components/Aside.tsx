import { Dispatch, SetStateAction } from 'react'
import { selectedMarkerType, observationsType } from '../types'

type detailProps = {
	selectedMarker: selectedMarkerType,
	showDetail: boolean,
	setShowDetail: Dispatch<SetStateAction<boolean>>,
	observations: observationsType[],
	noObservations: boolean
}


const Aside = (props: detailProps) => {

	const { selectedMarker, showDetail, setShowDetail, observations, noObservations } = props

	return (
		<aside className={showDetail ? 'aside active' : 'aside'}>
			<button className="close-info" onClick={() => setShowDetail(false)}>
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
			{selectedMarker && <h5>{selectedMarker.locName}</h5>}
			{noObservations ?
				<div className='obs-wrapper'>No observations recorded in the past 7 days.</div> :
				<div className='obs-wrapper'>Observations, past 7 days:
					<ul className='obs' >
						{observations.length && observations.map(
							hotspot => <li key={hotspot.speciesCode}>{hotspot.comName}, {hotspot.howMany ? hotspot.howMany : 1}</li>
						)}
					</ul>
				</div>
			}
		</aside>
	)
}

export default Aside
