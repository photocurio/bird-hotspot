import { Dispatch, SetStateAction } from 'react'

export type selectedMarkerType = {
	locId: string,
	locName: string
}

export type viewType = {
	longitude: number,
	latitude: number,
	zoom: number
}

export type observationsType = {
	speciesCode: string,
	comName: string,
	howMany: number
}

export type MarkerType = {
	[key: string]: {
		geometry: {
			type: 'Point',
			coordinates: [number, number]
		},
		type: 'Feature',
		properties: {
			locId: string,
			locName: string,
			countryCode: string,
			subnational1Code: string,
			subnational2Code: string
		}
	}[]
}

export type MapViewProps = {
	viewState: viewType,
	setViewState: Dispatch<SetStateAction<viewType>>,
	selectedMarker: selectedMarkerType,
	setSelectedMarker: Dispatch<SetStateAction<selectedMarkerType>>,
	setMapLoaded: Dispatch<SetStateAction<boolean>>,
	openModal: boolean
}

export type StateLookup = { [key: string]: string }

export type CountiesType = string[]
