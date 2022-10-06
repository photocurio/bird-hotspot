<template>
    <div class="about-info">
        <button class="close-icon" @click="$emit('closeModal', 'close')">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="currentColor"
                class="bi bi-x-lg"
                viewBox="0 0 16 16"
            >
                <path
                    d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"
                />
            </svg>
        </button>
        <h3>About Bird Hotspot</h3>
        <p>
            This site answers the question
            <em>"What birds have been seen in the past 7 days at my favorite hotspots?"</em>
        </p>
        <p>
            To navigate to a town or city, enter your location and a state, in the search form:
            <code>Missoula, MT</code>. It only works in the United States.
        </p>
    </div>
</template>
