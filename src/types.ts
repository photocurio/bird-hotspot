export type selectedMarkerType = {
	locId: string,
	locName: string
}

export type viewType = {
	longitude: number,
	latitude: number,
	zoom: number
} | null

export type observationsType = {
	speciesCode: string,
	comName: string,
	howMany: number
}
