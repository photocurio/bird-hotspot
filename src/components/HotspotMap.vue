<template>
    <div class="map-wrapper">
        <div class="about-info"></div>
        <div id="map"></div>
    </div>
</template>

<script>
import mapboxgl from 'mapbox-gl'
import stateCodes from '../data/state-codes'
import { difference, uniq } from 'underscore'
export default {
    data() {
        return {
            markers: {}
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
        // Initialize the map:
        // 1. add controls
        // 2. load county data
        // 3. add invisible county boundaries
        // 4. add event listeners
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
                map.addLayer({
                    id: 'counties',
                    type: 'fill',
                    source: 'counties',
                    'source-layer': 'original',
                    paint: {
                        'fill-outline-color': 'rgba(0,0,0,0)',
                        'fill-color': 'rgba(0,0,0,0)'
                    }
                })
            })

            map.on('sourcedata', (e) => {
                // only fetch the counties if the county layer is loaded.
                if (e.sourceId !== 'counties' || !e.isSourceLoaded || !e.hasOwnProperty('tile')) return
                this.redrawHotspots()
            })

            map.on('zoom', this.redrawHotspots)

            map.on('moveend', this.redrawHotspots)
        },

        // eBird returns hotspots organized by county. We need to know which counties to
        // fetch and display hotspots for. Get an array of counties present on the map,
        // and compare it to any counties that are already in memory. Determine which counties
        // need to be removed fromt the map, and which counties need to be added to the map.
        async redrawHotspots() {
            const countiesPresent = this.getCounties()
            if (countiesPresent.length > 20) {
                this.$emit('closeInfo')
                return this.$emit('errorMessage', 'Unable to fetch all the birding hotspots. Try zooming in.')
            } else {
                this.$emit('errorMessage', null)
            }
            const countiesToAdd = difference(countiesPresent, Object.keys(this.markers))
            const countiesToRemove = difference(Object.keys(this.markers), countiesPresent)

            if (countiesToAdd.length) {
                await Promise.all(
                    countiesToAdd.map(async (countyCode) => {
                        await this.getHotspots(countyCode)
                    })
                )
            }

            if (countiesToRemove.length) {
                countiesToRemove.forEach((countyCode) => {
                    this.removeHotspots(countyCode)
                })
            }
        },

        // Gets the birding hotspots for a county from eBird. Uses a serverless function.
        // Hotspots are saved to state in an array, keyed to the county code.
        // All saved hotspots are applied to the map.
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
                    this.markers[countyCode] = hotspots
                    this.applyHotspots(hotspots)
                }
            }
        },

        // For each hotspot, create a button and add it to the map.
        applyHotspots(hotspots) {
            hotspots.forEach((hotspot) => {
                const el = document.createElement('button')
                el.className = 'marker'
                el.setAttribute('data-name', hotspot.properties.locName)
                el.setAttribute('data-id', hotspot.properties.locId)
                el.setAttribute('id', hotspot.properties.locId)
                el.addEventListener('click', (e) => this.$emit('marker', e))
                new mapboxgl.Marker(el).setLngLat(hotspot.geometry.coordinates).addTo(map)
            })
        },

        // Remove sets of hotspots that are in counties longer present on the map.
        removeHotspots(county) {
            if (!this.markers.hasOwnProperty([county])) return
            this.markers[county].forEach((marker) => {
                const el = document.getElementById(marker.properties.locId)
                if (el) el.remove()
            })
            delete this.markers[county]
        },

        // Get an array of 5 digit county FIPS codes. These are the counties that are
        // present on the visible portion of the map.
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
