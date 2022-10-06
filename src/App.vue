<template>
    <div class="d-flex flex-column h-100">
        <HeaderNav />
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

        <main id="main">
            <HotspotMap @marker="handleMarker" @errorMessage="handleErrorMessage" @closeInfo="handleClose" />
            <Transition name="slide" mode="out-in">
                <HotspotInfo
                    v-if="info"
                    @closeInfo="handleClose"
                    :marker-name="markerName"
                    :obs="obs"
                    :height="mainHeight"
                />
            </Transition>
        </main>
        <AppFooter />
    </div>
</template>
  
<script>
import HeaderNav from './components/HeaderNav'
import AppFooter from './components/AppFooter'
import HotspotMap from './components/HotspotMap'
import HotspotInfo from './components/HotspotInfo'
import { toArray } from 'underscore'
export default {
    components: {
        HeaderNav,
        AppFooter,
        HotspotMap,
        HotspotInfo
    },
    data() {
        return {
            info: false,
            markerName: null,
            markerId: null,
            errorMessage: '',
            obs: [],
            mainHeight: null
        }
    },
    mounted() {
        this.getMapHeight()
    },
    methods: {
        getMapHeight() {
            const el = document.getElementById('main')
            this.mainHeight = el.offsetHeight
        },
        handleClose() {
            const markers = toArray(document.getElementsByClassName('marker'))
            markers.forEach((marker) => marker.classList.remove('active'))
            this.info = false
            this.markerName = null
            this.markerId = null
        },
        async handleMarker(e) {
            this.info = false
            this.markerName = e.target.attributes['data-name']['nodeValue']
            // this.markerId = e.target.attributes['data-id']['nodeValue']
            this.obs = await this.getObservations(e.target.attributes['data-id']['nodeValue'])
            this.info = true
        },
        handleErrorMessage(e) {
            this.errorMessage = e
        },
        async getObservations(markerId) {
            const res = await fetch(`/.netlify/functions/observations/?locationCode=${markerId}&fmt=json&back=7`)
            if (!res.ok) {
                return console.log(`Error: ${res.status}, ${res.statusText}`)
            } else {
                const observations = await res.json()
                if (observations.length) {
                    return observations
                }
            }
        }
    }
}
</script>
