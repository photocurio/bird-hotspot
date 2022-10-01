<template>
    <aside>
        <h5>{{ markerName }}</h5>
        <ul class="obs">
            <li v-for="ob in obs" v-bind:key="ob.speciesCode">{{ ob.comName }}, {{ ob.howMany ? ob.howMany : 1 }}</li>
        </ul>
        <button v-on:click="$emit('closeInfo')" class="btn btn-sm btn-info">&rarr;</button>
    </aside>
</template>

<script>
export default {
    props: {
        markerName: String,
        obs: Array
    }
}
</script>

