const trackStatisticIntervals = {
    sad: {
        dance: {
            low: 0,
            high: .5
        },
        energy: {
            low: 0,
            high: .3
        },
        tempo: {
            low: 0,
            high: 120
        },
        valence: {
            low: 0,
            high: .5
        }
    },
    calm: {
        dance: {
            low: 0,
            high: 1
        },
        energy: {
            low: 0,
            high: .3
        },
        tempo: {
            low: 0,
            high: 120
        },
        valence: {
            low: 0,
            high: 1
        }
    },
    happy: {
        dance: {
            low: .5,
            high: 1
        },
        energy: {
            low: .5,
            high: 1
        },
        tempo: {
            low: 120,
            high: 1000,
        },
        valence: {
            low: .8,
            high: 1
        }
    },
    energetic: {
        dance: {
            low: .6,
            high: 1
        },
        energy: {
            low: .75,
            high: 1
        },
        tempo: {
            low: 120,
            high: 1000
        },
        valence: {
            low: 0,
            high: 1
        }
    },
    angry: {
        dance: {
            low: 0,
            high: 1
        },
        energy: {
            low: .6,
            high: 1
        },
        tempo: {
            low: 0,
            high: 1000
        },
        valence: {
            low: 0,
            high: .6
        }
    },
    
}

module.exports = { trackStatisticIntervals }