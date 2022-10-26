import { animated, useSpring } from '@react-spring/web'


const DetailView = ( props ) => {
	const { selectedMarker, height, showDetail, setShowDetail, observations } = props
	const detailStyles = useSpring( {
		left: showDetail ? window.innerWidth - 300 : window.innerWidth,
		height: height
	} )
	return (
		<animated.aside style={ detailStyles } >
			<button className="close-info" onClick={ () => setShowDetail( false ) }>
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
			<h5>{ selectedMarker.locName }</h5>
			{ observations.length ?
				'Observations, past 7 days:' :
				'No observations recorded in the past 7 days.'
			}
			<ul className={ 'obs' } >
				{ observations.map( hs => {
					return <li key={ hs.speciesCode }>{ hs.comName }, { hs.howMany ? hs.howMany : 1 }</li>
				} ) }
			</ul>
		</animated.aside >
	)
}

export default DetailView
