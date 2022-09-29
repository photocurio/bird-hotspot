<template>
    <div class="d-flex flex-column h-100">
        <HeaderNav />
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        <main>
            <HotspotMap @marker="handleMarker" @errorMessage="handleErrorMessage" @closeInfo="handleClose" />

            <Transition name="slide-in">
                <HotspotInfo v-if="info" @closeInfo="handleClose" :marker-name="markerName" :obs="obs" />
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
            obs: []
        }
    },
    methods: {
        async handleMarker(e) {
            this.info = false
            this.markerName = e.target.attributes['data-name']['nodeValue']
            // this.markerId = e.target.attributes['data-id']['nodeValue']
            this.obs = await this.getObservations(e.target.attributes['data-id']['nodeValue'])
            this.info = true
        },
        handleClose() {
            this.info = false
            this.markerName = null
            this.markerId = null
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
