
const express = require('express')
const app = express()
const port = 3000
const cors = require('cors')
const fetch = require('node-fetch')

app.use(express.json())
app.use(cors())
app.use(express.static('public'))

app.post('/inference', async (req, res) => {
  const message = req.body.message
  console.log("Starting inference", message)
  await fetch('https://api.fakeyou.com/tts/inference', {
    method: 'POST',
    mode: 'no-cors',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "tts_model_token": 'weight_q7g0yw69sha8dgh732p58r1kk', // This is a glados voice model
      "uuid_idempotency_token": Math.random().toString(36).substring(7),
      "inference_text": message
    })
  }).then(r => r.json()).then(data => {
    console.log({ data })
    if (data.success) {
      pollForLine(res, data.inference_job_token)
    }
  }).catch(e => {
    console.log({ e })
  })
})

async function pollForLine(res, token) {
  console.log("Polling for line...", token)
  await fetch(`https://api.fakeyou.com/tts/job/${token}`).then(r => r.json()).then(data => {
    console.log({ data: data })
    if (data.success == true) {
      if (data.state.status === 'complete_success') {
        const audioUrl = 'https://storage.googleapis.com/vocodes-public' + data.state.maybe_public_bucket_wav_audio_path
        res.send({ audioUrl })
      } else {
        console.log('Pending...')
        setTimeout(() => pollForLine(res, token), 1000)
      }
    } else {
      throw new Error("Error in pollForLine")
    }
  })

}

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
