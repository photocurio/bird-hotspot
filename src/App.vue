<template>
    <div class="d-flex flex-column h-100">
        <HeaderNav />
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        <main>
            <HotspotMap v-on:marker="handleMarker" v-on:errorMessage="handleErrorMessage" />

            <Transition name="slide-in">
                <HotspotInfo v-if="info" v-on:close="handleClose" :markerName="markerName" :markerId="markerId" />
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
            errorMessage: ''
        }
    },
    methods: {
        handleMarker(e) {
            this.markerName = e.target.attributes['data-name']['nodeValue']
            this.markerId = e.target.attributes['data-id']['nodeValue']
            this.info = true
        },
        handleClose() {
            this.info = false
        },
        handleErrorMessage(e) {
            this.errorMessage = e
        }
    }
}
</script>
