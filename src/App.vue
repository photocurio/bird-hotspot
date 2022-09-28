<template>
    <div class="d-flex flex-column h-100">
        <HeaderNav />
        <main>
            <HotspotMap v-on:marker="handleMarker" />
            <HotspotInfo v-if="info" v-on:close="handleClose" :markerName="markerName" />
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
            markerName: null
        }
    },
    methods: {
        handleMarker(e) {
            console.log(e.target.attributes)
            this.markerName = e.target.attributes['data-name']['nodeValue']
            this.info = true
        },
        handleClose() {
            this.info = false
        }
    }
}
</script>
