<template>
  <LandingHead class="is-fullheight" :loginUri="spotifyUrl" />
</template>

<script>
import buildUrl from 'build-url'
import getPkce from 'oauth-pkce'
import LandingHead from '@/components/LandingHead'

export default {
  components: { LandingHead },

  data: function () {
    return {
      spotifyUrl: null
    }
  },

  mounted() {
    this.generateSpotifyLoginUri();
  },

  methods: {
    generateSpotifyLoginUri() {
      const codePage = this.$router.resolve({ name: 'code' })
      const redirectUri = `${location.origin}${codePage.href}`

      const generatePkce = () => {
        return new Promise((resolve) => {
          getPkce(64, (error, data) => {
            if (error) throw error;

            resolve(data);
          });
        });
      }

      generatePkce().then(({ verifier, challenge }) => {
        const queryParams = {
          client_id: process.env.VUE_APP_SPOTIFY_CLIENT_ID,
          redirect_uri: redirectUri,
          response_type: 'code',
          scope: 'user-read-currently-playing',
          code_challenge_method: "S256",
          code_challenge: challenge,
          state: verifier
        }

        this.spotifyUrl = buildUrl('https://accounts.spotify.com/authorize', { queryParams })
      });
    }
  }
}
</script>
