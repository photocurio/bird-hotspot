import { Dispatch, SetStateAction } from 'react'

type modalProps = {
	openModal: boolean,
	setOpenModal: Dispatch<SetStateAction<boolean>>,
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
			<p>This site answers the question: </p>
			<p><em>&ldquo;What birds have been seen at my favorite hotspots in the past 7 days?
				&rdquo;</em></p>
			<p>To navigate to a town or city, enter a location and state in the search
				form: <code>Missoula, MT</code>.</p>
			<p>Bird Hotspot only works in the United States at this time.</p>
		</div>
	)
}

export default Modal
