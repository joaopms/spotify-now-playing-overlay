<template>
  <div>
    <LandingHead class="is-light" :showLoginButton="false" />

    <section class="section">
      <div class="container">
        <div class="columns">
          <div class="column">
            <p class="is-size-4 has-text-weight-semibold">Settings</p>

            <hr />

            <div class="level is-mobile">
              <div class="level-left">
                <div class="level-item">
                  <p>Show Spotify Logo</p>
                </div>
              </div>

              <div class="level-right">
                <b-switch v-model="settings.showSpotifyLogo" />
              </div>
            </div>

            <div class="level is-mobile">
              <div class="level-left">
                <div class="level-item">
                  <p>Show Album Art</p>
                </div>
              </div>

              <div class="level-right">
                <b-switch v-model="settings.showAlbumArt" />
              </div>
            </div>

            <div class="level is-mobile">
              <div class="level-left">
                <div class="level-item">
                  <p>Show Artist</p>
                </div>
              </div>

              <div class="level-right">
                <b-switch v-model="settings.showArtist" />
              </div>
            </div>
          </div>

          <div class="column">
            <p class="is-size-4 has-text-weight-semibold">Preview</p>

            <hr />

            <div class="preview" v-if="tokens">
              <figure class="screen image is-16by9">
                <img src="@/assets/img/sample-game-screen.jpg" alt="Game Screen">
              </figure>

              <NowPlaying class="widget" :showAlbumArt="settings.showAlbumArt" :showArtist="settings.showArtist"
                :showSpotifyLogo="settings.showSpotifyLogo" :accessToken="tokens.accessToken"
                :refreshToken="tokens.refreshToken" />
            </div>

            <p class="has-text-weight-semibold">Paste the following URL to a browser source:</p>

            <textarea class="textarea" readonly v-text="browserSourceUrl"></textarea>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import queryString from 'query-string'

import LandingHead from '@/components/LandingHead'
import NowPlaying from '@/components/NowPlaying'

const endpointUri = 'https://accounts.spotify.com/api/token'

export default {
  components: { LandingHead, NowPlaying },

  computed: {
    spotifyCode() {
      return this.$route.query.code;
    },
    spotifyVerifier() {
      return this.$route.query.state;
    },


    browserSourceUrl() {
      if (!this.tokens) {
        return null;
      }

      const nowPlayingPage = this.$router.resolve({ name: 'nowPlaying' }),
        base = `${location.origin}${nowPlayingPage.href}`

      const query = queryString.stringify({
        ...this.tokens,
        ...this.settings
      })

      return `${base}?${query}`
    }
  },

  data: () => ({
    tokens: null,
    settings: {
      showSpotifyLogo: true,
      showAlbumArt: true,
      showArtist: true
    }
  }),

  mounted() {
    this.getSpotifyAccessToken();
  },

  methods: {
    getSpotifyAccessToken() {
      const codePage = this.$router.resolve({ name: 'code' })
      const redirectUri = `${location.origin}${codePage.href}`

      const data = {
        grant_type: "authorization_code",
        code: this.spotifyCode,
        redirect_uri: redirectUri,
        client_id: process.env.VUE_APP_SPOTIFY_CLIENT_ID,
        code_verifier: this.spotifyVerifier,
      }
      const headers = {
        'Content-Type': "application/x-www-form-urlencoded"
      }

      this.$http.post(endpointUri, data, { headers })
        .then(response => {
          this.tokens = {
            accessToken: response.data.access_token,
            refreshToken: response.data.refresh_token,
          }
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.preview {
  position: relative;
  margin-bottom: 1rem;

  .widget {
    position: absolute;
    top: 1rem;
    left: 1rem;
    right: 1rem;
  }
}
</style>
