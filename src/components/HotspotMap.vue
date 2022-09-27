<template>
    <div id="map"></div>
</template>

<script>
import mapboxgl from 'mapbox-gl'

import { Popover } from 'bootstrap'
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
                center: location, // [lng, lat]
                zoom: 9.5
            })
            map.addControl(
                new mapboxgl.GeolocateControl({
                    positionOptions: {
                        enableHighAccuracy: true
                    },
                    trackUserLocation: false
                })
            )
            map.on('load', () => {
                this.applyHotspots(map)
            })
            map.on('move', () => console.log(map.getBounds()))
        },
        async getHotspots() {
            const requestOptions = {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            }
            const res = await fetch(`/.netlify/functions/hotspots?regioncode=US-MA-017&back=7`, requestOptions)
            if (!res.ok) {
                const message = `Error: ${res.status}, ${res.statusText}`
                this.hotspots = [message]
            }
            this.hotspots = await res.json()
        },
        applyHotspots(map) {
            this.hotspots.forEach((hotspot) => {
                const el = document.createElement('button')
                el.className = 'marker'
                el.setAttribute('data-bs-toggle', 'popover')
                el.setAttribute('data-bs-content', hotspot.properties.locName)
                new mapboxgl.Marker(el).setLngLat(hotspot.geometry.coordinates).addTo(map)
                new Popover(el, { trigger: 'focus hover' })
            })
        }
    }
}
</script>
