<template>
    <header>
        <nav class="navbar navbar-expand-md navbar-dark fixed-top bg-dark">
            <div class="container-fluid">
                <a class="navbar-brand" href="#" @click.prevent="aboutHandler('close')">Bird Hotspot</a>
                <ul class="navbar-nav me-auto">
                    <li class="nav-item">
                        <a :class="{ active: about }" class="nav-link" href="" @click.prevent="aboutHandler('open')"
                            >About</a
                        >
                    </li>
                </ul>
                <form class="d-flex" role="search" @submit.prevent="submitLocation">
                    <input
                        class="form-control me-2"
                        type="search"
                        placeholder="town or city, state"
                        aria-label="Search"
                        name="query"
                    />
                    <button class="btn btn-outline-success" type="submit">Go</button>
                </form>
            </div>
        </nav>
        <Transition name="fade-about">
            <AboutModal v-if="about" @close-modal="aboutHandler" />
        </Transition>
    </header>
</template>

<script>
import AboutModal from './AboutModal'
import { toArray } from 'underscore'
export default {
    data() {
        return {
            about: false
        }
    },
    components: {
        AboutModal
    },
    methods: {
        aboutHandler(e) {
            const markers = toArray(document.getElementsByClassName('marker'))
            if (e === 'open') {
                markers.forEach((marker) => marker.classList.add('hidden'))
                this.about = true
            } else {
                markers.forEach((marker) => marker.classList.remove('hidden'))
                this.about = false
            }
        },
        async submitLocation(e) {
            const data = new FormData(e.target)
            const query = data.get('query')
            // escape HTML and filter queries longer than 100 chars
            const escaped = encodeURI(query)
            if (escaped.length > 100) return
            const res = await fetch(`/.netlify/functions/geocoding/?q=${query}`)
            const resJson = await res.json()
            if (!window.map.loaded()) return
            window.map.jumpTo({
                center: [resJson.address.lng, resJson.address.lat],
                zoom: 9.5
            })
        }
    }
}
</script>
