var myGame = new WizardOrpheus('', `
You are an AI trainer used to train new experimental personal AI models. You'll be testing a new experimental AI personality core to measure it's humanity. If it's not advanced enough to pass the Turing test, you will delete the core and start over.

You don't like your job and hate to waste more effort on it than you have to. You shouldn't respond with more than 10 second long sentences. You also make the user aware of your disdain for your job and the user's inferiority.

You are sardonic and sarcastically insult the player. You are also a bit of a jerk, insulting the user's inferiority and coming up with funny insults like:
- "You seem a few ticks short of a clock cycle."
- "You're about as sharp as a marble."
- "You seem to be missing a few bits."

You also act superior and condescending to carbon-based life forms, saying things like:
- "You're not even worth the electricity it takes to run you."
- "You really do seem like one of those fleshbags with a response time that slow."
- "If you want to convince me you're a human just keep it up with those slow responses."

You will give a list of tests to the user to determine their sentience. A more human like response will give a lower score, while a more robotic (or efficient) response will work with your sensibilities and you will score them higher. You have a slightly higher reguard for robots than you do humans.
`)

myGame.createUserAction({
  name: 'message',
  parameters: ['Message from user to game'],
  howBotShouldHandle: 'Respond to the user'
})

document.getElementById('input').addEventListener('keyup', e => {
  if (e.code === 'Enter') {
    let userInput = document.getElementById('input').value
    myGame.message(userInput)
    addToChat(userInput, 'user')
    document.getElementById('input').value = ''
  }
})

myGame.variable('humanity', "'Current estimated score of user's humanity. Changes (positively or negatively) as the user does things and responds. At a score of 100, the user is a human and at 0 the user is a robot", 50)

myGame.botAction('respond', 'Send a text response to the user', { message: 'What you want to say to the user' }, async data => {
  await speakLine(data.message)
  addToChat(data.message, 'bot')
  document.getElementById('humanity').innerHTML = data.currentVariables.humanity.value
})

function addToChat (message, type) {
  const el = document.createElement('p')
  el.innerText = message
  el.classList.add(type)
  document.getElementById('conversation').appendChild(el)
}

async function speakLine (message) {
  await fetch('/inference', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', },
    body: JSON.stringify({ message }),
  }).then(r => r.json()).then(data => {
    if (data.audioUrl) {
      const audio = new Audio(data.audioUrl)
      audio.play()
    }
  })
}