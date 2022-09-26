<template>
    <div class="d-flex flex-column h-100">
        <HeaderNav />
        <BirdHotspotMap />
        <AppFooter />
    </div>
</template>
  
<script>
import HeaderNav from './components/HeaderNav'
import AppFooter from './components/AppFooter'
import BirdHotspotMap from './components/BirdHotspotMap'
export default {
    components: {
        HeaderNav,
        AppFooter,
        BirdHotspotMap
    },
    data() {
        return {
            name: 'Vue'
        }
    }
}
</script>
