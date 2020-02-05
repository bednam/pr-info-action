const core = require('@actions/core')
const github = require('@actions/github') 
const fs = require('fs')

async function run() {
	try {
		const comments = [{"path":"b6.txt","user":"MichalBednarz","body":"asdfa","line":3},{"path":"b6.txt","user":"MichalBednarz","body":"asdfads","line":5}]
		const filePath = 'ReviewComments.json'
		fs.writeFile(filePath, JSON.stringify(comments), (err) => {
		  if(err) throw err
		  console.log('The file has been saved!');
		})
		return
		const {
			context: {
				payload: {
					pull_request,
					repository
				}
			}
		} = github


		if(!pull_request || !pull_request.merged) {
			throw new Error('Action should be run on merged pull request event')
		}

		const commentsUrl = pull_request._links.review_comments.href
		const commentsEndpoint = commentsUrl.replace('https://api.github.com', '')

		const repoToken = core.getInput('repo-token')
		const octokit = new github.GitHub(repoToken, {
			previews: ["comfort-fade-preview", "everest-preview"]
		})

		const commentsRes = try {
			await octokit.request(commentsUrl)
		} catch(e) {
			console.log(e)	
			return false
		}
		if(!commentsRes) return
		
		const comments = commentsRes.data.map(comment => ({
			path: comment.path,
			user: comment.user.login,
			body: comment.body,
			line: comment.line
		}))

		// in current implementation sbt generateSnapshot will look for the file named ReviewComments.json
		const filePath = 'ReviewComments.json'
		const fileContent = JSON.stringify(comments)
		fs.writeFile(filePath, fileContent, (err) => {
		  if(err) throw err
		  console.log('The file has been saved!');
		})

	} catch (error) {
	  core.setFailed(error.message)
	}
}

run()
