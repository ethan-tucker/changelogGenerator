# Ethan Tucker's Changelog Generator Submission

## How to Run changelogGenerator

I decided to host my solution for ease of testing. The frontend applications are accessible at: 
 - User Facing Site: https://changelog-generator-rose.vercel.app/
 - Dev Tool: https://changelog-generator-rose.vercel.app/dev
 - Back End Commits Endpoint: https://changelog-backend-service-63ed802d99d2.herokuapp.com/api/commits 

If you are interested in running locally, please reach out to me directly as it would require configuring the .env file correctly for both the client and server. The Github repositories for the project can be seen here:
 - Front End:  https://github.com/ethan-tucker/changelogGenerator
 - Back End: https://github.com/ethan-tucker/changelogGeneratorService

## System Design
I only had a day or so to make the majority of the design decisions and implement the entirety of this project so I made some simplifying decisions to allow me to focus on the core features of the site. The features that fell below the line can be seen at the bottom of this section. First I will talk about the core features.

For this project I built around the core features called out in the specification. Namely, end-users needed to be able to view changelog entries and developers needed to be able to generate new changelog entries. On top of those baseline requirements I added a few additional user requirements that informed my design. 
- Functional requirements:
	- End-users can request changelog entries (and they are displayed from newest to oldest)
	- End-users can click on a link from a changelog bullet point to see the relevant commit to dive deeper into the change
	- Developers can generate new changelog entries. They can set a date range for the commits included in the changelog and optionally add a version and title. 
	- Developers can view commits within their currently selected date range. This allows them to more effectively group commits together and have more visibility on what information they are aggregating.
	-  Developers can see the changelog that resulted from their requests (below the line: and can update it before publishing it). They also see active feedback after submitting so that they know their request is processing.
- High Level Design as informed by the above requirements
	- **/api/commits?startDate&endDate**: endpoint for developers to request to see commits within given date range (paginated as there could be hundreds of commits).
	- **GET /api/changelogs**: endpoint for end-users to request all existing changelog entries from newest to oldest. If there end up being hundreds of changelogs this could also be paginated.
	- **POST /api/changelogs**: endpoints for developers to request a new changelog to be generated. This takes in a startDate, endDate, and an optional version and name. It returns success/failure and then kicks off an async workflow to grab the relevant commits, generate the changelogs, and store them in the db 
	- **GET /api/changelogs/status/[id]**: Takes in the id of the changelog and returns whether or not its generation is complete. This is the api used by the client to long poll for the async workflow to complete. This allows the ui to update in "real time" as the request completes.

- Other potential points of interest
	- Initially I was generating the changelog based solely on the commit messages, which is a little dangerous for a couple reasons. First, it doesn't give the LLM a lot of context to work with and often the output was more or less just the commit message. Second, if the commit message is bad or not present then you are just out of luck. I decided to include some of the file changes themselves (called patches in github API response) in the openAI API request which greatly improved my output. Then one concern with this is that it greatly increases the input context tokens used and on a few occasions I actually errored out because the context was too large. The trade off between context size, cost, and quality of output is something that I would need more time to explore.

- Below the line:
	- User logins for devs: 
		- It would be great if this site allowed developers the ability to login, choose a repository and generate changelogs for that specific respository. This would also make the dev endpoint actually secure and not simply accessible at a globally available endpoint.
		- I decided to focus on the core experience of a developer generating changelogs rather than all of the extraneous login, authentication, and project selection. For the current experience I choose a random open source project with lots of commits and hard coded that as the project that devs will be making changelogs for.
	- The ability to edit/delete existing changelog entries
		- This is one I grappled the most with because it is such an important features for the developers. It would make writing of changelogs significantly more powerful if they could edit the output from the LLM. Additionally, it would be nice if they could delete changelogs that were misconfigured as there is no way to do that currently. 
		- This is the feature I would implement first if I had more time to work on the project because it is the biggest pain point as I see it in the current experience. The only way to make any edits is by directly interacting with the database which simply cannot continue to be the case.
	- Strict rules against including a commit in multiple changelogs
		- The system is rather optimistic in its current implementation in that there is no validation of the input range for changelog generation. This means that a user could upload a few changelogs for the exact same time frame. Ideally, there would be some safeguards in place (or at least the ability to edit/delete changelogs) to prevent this from happening. It doesn't make a lot of sense for the end user to see the same commit included across many changelogs.
		- To effectively implement some sort of input validation I would need to talk with the developers to understand what they would actually want. I would want to dig into the issue further to actually understand what validation would be helpful. The last thing I would want is to impose rules early and prevent developers from taking actions they need to take.

## Technologies Used

 - Front End
	 - **Next.js**: I went with Next.js because it is a framework that I have experience working with and cleanly handles multi-page applications. Any js framework would've worked here, this was just my preference.  
	 - **Tailwind**: Similar story to the above. This was simply my preference for this project. Tailwind is my slight preference for quick turn around project like this because I find it much quicker to edit styles in line and you also don't end up with the headache of maintaining and updating the styles down the road.
 - Back End
	 - **Express.js**: Not much to say for this one. Simple solution for the simple problems laid out for this task.
	 - **Javascript**: I have done express backends in both JS and TS and really only prefer JS for the speed of development. When working on longer tail projects I prefer having typing for easier maintainability.
 - Database
	 - **Firebase**: I have used Firebase for a project that stores similar data in the past. I like using it when there are arrays of values so that all of the data can be stored in the same place rather than across many rows especially for small scale projects like this. It is also incredibly easy to spin up and start using which is great for small projects. 
 - AI Tools
	 - **Claude**:	During the phone screen I was asked what sort of AI tooling I used and I answered honestly in that I had little experience with tools outside of Autopilot and chatGPT. I decided to use this project as an opportunity to give Claude a spin. This type of task seems like the perfect clean task for Claude as there are clear user requirements, I'm using popular languages and frameworks, and the problems that are being solved are also well documented. I used Claude as a starting place for a lot of the feature development by outlining the user data flow, sytem design, and desired user interface and manually iterated upon the output.
- Hosting
	- **Vercel (front end), Heroku (back end)**: I have used both of these services before so it was a quick and easy process to get the front and back end spun up to be accessed "in production". 