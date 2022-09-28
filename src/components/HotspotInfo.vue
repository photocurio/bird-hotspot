<template>
    <aside>
        <h5>{{ markerName }}</h5>
        <ul>
            <li>interesting</li>
            <li>OK</li>
            <li>it does not matter</li>
            <li>always ice cream</li>
            <li>whatEVER</li>
        </ul>
        <button v-on:click="$emit('close')" class="btn btn-sm btn-info">&rarr;</button>
    </aside>
</template>

<script>
export default {
    props: ['markerName'],
    data() {
        return {
            info: false
        }
    }
}
</script>

