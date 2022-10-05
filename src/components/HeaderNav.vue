<template>
    <header>
        <nav class="navbar navbar-expand-md navbar-dark fixed-top bg-dark">
            <div class="container-fluid">
                <a class="navbar-brand" href="#">Bird Hotspot</a>
                <button
                    class="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarCollapse"
                    aria-controls="navbarCollapse"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarCollapse">
                    <ul class="navbar-nav me-auto mb-2 mb-md-0">
                        <li class="nav-item">
                            <a :class="{ active: !about }" class="nav-link" href="" @click.prevent="homeHandler"
                                >Home</a
                            >
                        </li>
                        <li class="nav-item">
                            <a :class="{ active: about }" class="nav-link" href="" @click.prevent="aboutHandler"
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
            </div>
        </nav>
    </header>
</template>

<script>
export default {
    data() {
        return {
            about: false
        }
    },
    methods: {
        aboutHandler(e) {
            this.about = true
            this.$emit('about', true)
        },
        homeHandler(e) {
            this.about = false
            this.$emit('about', false)
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
