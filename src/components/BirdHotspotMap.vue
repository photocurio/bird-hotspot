<template>
    <div id="map"></div>
</template>

<script>
import mapboxgl from 'mapbox-gl'

// import { Popover } from 'bootstrap'
export default {
    mounted() {
        mapboxgl.accessToken =
            'pk.eyJ1IjoicGhvdG9jdXJpbyIsImEiOiJja3FqeDF5M2UwNHZ4MnZydXB2dXcyMzFoIn0.pwFXFrly8A-FTseV_kBlVg'
        const map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/outdoors-v11',
            center: [-71, 42.7], // starting position [lng, lat]
            zoom: 9.5
        })
    }
}
</script>
