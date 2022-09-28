<template>
    <div id="map"></div>
</template>

<script>
import mapboxgl from 'mapbox-gl'

export default {
    data() {
        return {
            hotspots: []
        }
    },
    mounted() {
        mapboxgl.accessToken =
            'pk.eyJ1IjoicGhvdG9jdXJpbyIsImEiOiJja3FqeDF5M2UwNHZ4MnZydXB2dXcyMzFoIn0.pwFXFrly8A-FTseV_kBlVg'
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((e) => {
                this.initMap([e.coords.longitude, e.coords.latitude])
                this.getHotspots(e.coords.longitude, e.coords.latitude)
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
        async getHotspots(lng, lat) {
            const regionCode = 'US-MA-017' //await this.getRegionCode(lng, lat)
            const res = await fetch(`/.netlify/functions/hotspots?regioncode=${regionCode}&back=7`)
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
                el.setAttribute('data-name', hotspot.properties.locName)
                el.setAttribute('data-id', hotspot.properties.locId)
                el.addEventListener('click', (e) => this.$emit('marker', e))
                new mapboxgl.Marker(el).setLngLat(hotspot.geometry.coordinates).addTo(map)
            })
        },
        async getRegionCode(lng, lat) {
            const countyResponse = await fetch(`/.netlify/functions/getcounty?lng=${lng}&lat=${lat}`)
            const countyFips = await countyResponse.json()
            const countyCode = countyFips.County.FIPS
            return `US-${countyFips.State.code}-${countyCode.substr(countyCode.length - 3)}`
        }
    },
    emits: ['marker']
}
</script>
