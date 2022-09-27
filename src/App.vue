<template>
    <div class="d-flex flex-column h-100">
        <HeaderNav />
        <HotspotMap />
        <AppFooter />
    </div>
</template>
  
<script>
import HeaderNav from './components/HeaderNav'
import AppFooter from './components/AppFooter'
import HotspotMap from './components/HotspotMap'
export default {
    components: {
        HeaderNav,
        AppFooter,
        HotspotMap
    }
}
</script>
