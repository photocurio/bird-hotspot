<template>
    <div class="map-wrapper">
        <div class="county-info">
            <p>counties: {{ counties.length }}</p>
            <p>markers: {{ markers.length }}</p>
        </div>
        <div id="map"></div>
    </div>
</template>

<script>
import mapboxgl from 'mapbox-gl'
import stateCodes from '../data/state-codes'
import { uniq, difference } from 'underscore'
export default {
    data() {
        return {
            counties: [],
            markers: []
        }
    },
    mounted() {
        mapboxgl.accessToken = process.env.MAPBOX_TOKEN
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((e) => {
                this.initMap([e.coords.longitude, e.coords.latitude])
            })
        } else {
            this.initMap([-74.5, 40])
        }
    },
    methods: {
        initMap(location) {
            window.map = new mapboxgl.Map({
                container: 'map',
                style: 'mapbox://styles/mapbox/outdoors-v11',
                center: location,
                zoom: 10
            })
            map.addControl(
                new mapboxgl.GeolocateControl({
                    positionOptions: {
                        enableHighAccuracy: true
                    },
                    trackUserLocation: false,
                    fitBoundsOptions: {
                        maxZoom: 11
                    }
                })
            )
            map.addControl(new mapboxgl.NavigationControl())
            map.on('load', () => {
                // Load vector county data.
                map.addSource('counties', {
                    type: 'vector',
                    url: 'mapbox://mapbox.82pkq93d'
                })
                // Add an invisible county layer.
                map.addLayer(
                    {
                        id: 'counties',
                        type: 'fill',
                        source: 'counties',
                        'source-layer': 'original',
                        paint: {
                            'fill-outline-color': 'rgba(0,0,0,0)',
                            'fill-color': 'rgba(0,0,0,0)'
                        }
                    },
                    'settlement-label'
                )
            })

            map.on('sourcedata', async (e) => {
                // only fetch the counties if the county layer is loaded.
                if (e.sourceId !== 'counties' || !e.isSourceLoaded || !e.hasOwnProperty('tile')) return
                this.redrawHotspots()
            })
            map.on('zoom', this.redrawHotspots)
            map.on('move', this.redrawHotspots)
        },

        async redrawHotspots() {
            const countiesPresent = await this.getCounties()
            if (countiesPresent.length > 20) {
                this.$emit('closeInfo')
                this.removeHotspots()
                return this.$emit(
                    'errorMessage',
                    'Unable to fetch birding hotspots in more than 20 counties. Try zooming in.'
                )
            } else {
                this.$emit('errorMessage', '')
            }
            // If all counties present are already in state, return.
            if (!difference(countiesPresent, this.counties)) return
            // Else, wipe the hotspots and re-draw.
            else {
                this.removeHotspots()
                this.counties = countiesPresent

                await Promise.all(
                    this.counties.map(async (countyCode) => {
                        await this.getHotspots(countyCode)
                    })
                )
            }
        },

        async getHotspots(countyCode) {
            const countyThreeDigit = countyCode.slice(-3)
            const stateTwoDigit = countyCode.slice(0, 2)
            const stateTwoChar = stateCodes[stateTwoDigit]
            const regionCode = `US-${stateTwoChar}-${countyThreeDigit}`
            const res = await fetch(`/.netlify/functions/hotspots?regioncode=${regionCode}&back=7`)
            if (!res.ok) {
                console.log(`Error: ${res.status}, ${res.statusText}`)
            } else {
                const hotspots = await res.json()
                if (hotspots.length) {
                    this.$emit('errorMessage', '')
                    this.applyHotspots(hotspots)
                }
            }
        },

        applyHotspots(hotspots) {
            hotspots.forEach((hotspot) => {
                // const dupes = this.markers.map((marker) => {
                //     if (marker._element.getAttribute('data-id') === hotspot.properties.locId) {
                //         return hotspot.properties.locId
                //     }
                // })
                // if (dupes.length) return
                const el = document.createElement('button')
                el.className = 'marker'
                el.setAttribute('data-name', hotspot.properties.locName)
                el.setAttribute('data-id', hotspot.properties.locId)
                el.addEventListener('click', (e) => this.$emit('marker', e))
                const marker = new mapboxgl.Marker(el).setLngLat(hotspot.geometry.coordinates).addTo(map)
                this.markers.push(marker)
            })
        },
        removeHotspots() {
            this.markers.forEach((marker) => marker.remove())
            this.markers = []
        },
        getCounties() {
            const topLeft = new mapboxgl.Point(0, 0)
            const bottomRight = new mapboxgl.Point(
                document.getElementById('map').offsetWidth,
                document.getElementById('map').offsetHeight
            )

            // pixelbox is an array of Mapbox points.
            // It represents the size of the map screen.
            const pixelbox = [topLeft, bottomRight]
            const countiesPresent = map.queryRenderedFeatures(pixelbox, {
                layers: ['counties']
            })

            // We only want the FIPS code for each county.
            const countyCodes = countiesPresent.map((c) => c.properties.FIPS.toString())

            // Remove duplicates and return the counties.
            const uniqCounties = uniq(countyCodes)
            return uniqCounties
        }
    },
    emits: ['marker', 'errorMessage', 'closeInfo']
}
</script>
