type modalProps = {
	openModal: boolean,
	setOpenModal: (showDetail: boolean) => void,
}

import times from '../images/times.svg'


const Modal = (props: modalProps) => {
	const { openModal, setOpenModal } = props
	return (
		<div className={openModal ? "about-info open" : "about-info"} >
			<button className="close-icon" onClick={() => setOpenModal(false)}
			><img src={times} alt="close hotspot details"
				/></button>
			<h3>About Bird Hotspot</h3>
			<p>This site answers the question: <br />
				<em>&ldquo;What birds have been seen in the past 7 days
					at my favorite hotspots ?&rdquo;</em></p>
			<p>To navigate to a town or city, enter a location and state in the search
				form: <code>Missoula, MT </code>. It only works in the United States.</p>
		</div>
	)
}

export default Modal
