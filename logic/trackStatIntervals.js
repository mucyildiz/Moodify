const trackStatisticIntervals = {
    sad: {
        dance: {
            low: 0,
            high: .5
        },
        energy: {
            low: 0,
            high: .5
        },
        tempo: {
            low: 0,
            high: 140
        },
        valence: {
            low: 0,
            high: .5
        }
    },
    calm: {
        dance: {
            low: 0,
            high: .5
        },
        energy: {
            low: 0,
            high: .5
        },
        tempo: {
            low: 0,
            high: 140
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
            low: 140,
            high: 1000,
        },
        valence: {
            low: .5,
            high: 1
        }
    },
    energetic: {
        dance: {
            low: .5,
            high: 1
        },
        energy: {
            low: .7,
            high: 1
        },
        tempo: {
            low: 140,
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
            low: 140,
            high: 1000
        },
        valence: {
            low: 0,
            high: .6
        }
    },
    love: {
        dance: {
            low: 0,
            high: .5
        },
        energy: {
            low: 0,
            high: .5,
        },
        tempo: {
            low: 0,
            high: 120
        },
        valence: {
            low: .5,
            high: 1,
        }
    }
    
}

module.exports = { trackStatisticIntervals }