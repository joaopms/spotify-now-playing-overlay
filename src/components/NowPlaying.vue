<template>
  <div class="media">
    <div class="media-left" v-show="showAlbumArt">
      <figure class="image" :class="{ 'is-64x64': showArtist, 'is-48x48': !showArtist }">
        <PreloadedImage v-if="albumArt" :src="albumArt" alt="Album Art" />
      </figure>
    </div>

    <div class="media-content">
      <p class="is-size-4 has-text-white">{{ trackName }}</p>

      <p class="is-size-6 has-text-white" v-show="showArtist">
        {{ artistName }}
      </p>
    </div>

    <div class="media-right" v-show="showSpotifyLogo">
      <figure class="image is-32x32">
        <img src="@/assets/svg/spotify-logo-without-text.svg" alt="Spotify">
      </figure>
    </div>
  </div>
</template>

<script>
import PreloadedImage from '@/components/PreloadedImage'

const playingEndpointUri = 'https://api.spotify.com/v1/me/player/currently-playing'
const refreshEndpointUri = 'https://accounts.spotify.com/api/token'

export default {
  components: { PreloadedImage },

  props: {
    showArtist: {
      type: Boolean,
      default: true
    },

    showAlbumArt: {
      type: Boolean,
      default: true
    },

    showSpotifyLogo: {
      type: Boolean,
      default: true
    },

    accessToken: {
      type: String,
      default: null
    },
    refreshToken: {
      type: String,
      default: null
    }
  },

  data: () => ({
    userPlayer: null,
    newAccessToken: null,
    newRefreshToken: null,
    refreshTimer: null,
  }),

  computed: {
    trackName() {
      return this.userPlayer ? this.userPlayer.item.name : null
    },

    artistName() {
      if (!this.userPlayer || this.userPlayer.item.artists.length == 0) {
        return null
      }

      return this.userPlayer.item.artists[0].name
    },

    albumArt() {
      if (!this.userPlayer || this.userPlayer.item.album.images.length == 0) {
        return null
      }

      return this.userPlayer.item.album.images[0].url
    }
  },

  created() {
    this.newAccessToken = this.accessToken;
    this.newRefreshToken = this.refreshToken;
  },

  mounted() {
    this.loadUserPlayer()
  },

  methods: {
    loadUserPlayer() {
      const headers = {
        'Authorization': `Bearer ${this.newAccessToken}`
      }

      this.$http.get(playingEndpointUri, { headers })
        .then(response => {
          this.userPlayer = response.data

          if (!this.refreshTimer) {
            setTimeout(this.loadUserPlayer, 5000)
          }
        })
        .catch((err) => {
          if (err.status === 401) {
            this.refreshAccessToken();
          }
        });
    },
    refreshAccessToken() {
      if (!this.newRefreshToken) {
        return;
      }

      const data = {
        grant_type: "refresh_token",
        refresh_token: this.refreshToken,
        client_id: process.env.VUE_APP_SPOTIFY_CLIENT_ID
      }
      const headers = {
        'Content-Type': `application/x-www-form-urlencoded`
      }

      this.$http.post(refreshEndpointUri, data, { headers })
        .then(response => {
          this.newAccessToken = response.data.access_token;
          this.newRefreshToken = response.data.refresh_token;

          if (!this.refreshTimer) {
            setTimeout(this.loadUserPlayer, 5000)
          }

          const url = new URL(window.location)
          url.searchParams.set("accessToken", this.newAccessToken)
          url.searchParams.set("refreshToken", this.newRefreshToken)
          window.location = url
        });
    }
  }
}
</script>

<style lang="scss" scoped>
.media {
  background: rgba(10, 10, 10, 0.75);
  border-radius: 4px;
  padding: 1rem;

  align-items: center;
}

.media-content {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
</style>
