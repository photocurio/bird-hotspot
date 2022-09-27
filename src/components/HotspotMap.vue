<template>
    <div id="map"></div>
</template>

<script>
import mapboxgl from 'mapbox-gl'

// import { Popover } from 'bootstrap'
export default {
    data() {
        return {
            hotspots: []
        }
    },
    created() {
        this.getHotspots()
    },
    mounted() {
        mapboxgl.accessToken =
            'pk.eyJ1IjoicGhvdG9jdXJpbyIsImEiOiJja3FqeDF5M2UwNHZ4MnZydXB2dXcyMzFoIn0.pwFXFrly8A-FTseV_kBlVg'
        const map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/outdoors-v11',
            center: [-71, 42.7], // starting position [lng, lat]
            zoom: 9.5
        })
        map.on('load', () => {
            this.applyHotspots(map)
        })
    },
    methods: {
        async getHotspots() {
            const requestOptions = {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            }
            const res = await fetch(`/.netlify/functions/hotspots?regioncode=US-MA-009&back=8`, requestOptions)
            if (!res.ok) {
                const message = `Error: ${res.status}, ${res.statusText}`
                this.hotspots = [message]
            }
            this.hotspots = await res.json()
        },
        applyHotspots(map) {
            this.hotspots.forEach((hotspot) => {
                const el = document.createElement('div')
                el.className = 'marker'
                el.setAttribute('data-bs-toggle', 'popover')
                el.setAttribute('data-bs-content', hotspot.properties.locName)
                new mapboxgl.Marker(el).setLngLat(hotspot.geometry.coordinates).addTo(map)
            })
        }
    }
}
</script>
