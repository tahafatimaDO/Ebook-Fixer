[![main](https://img.shields.io/badge/build-passing-brightgreen)]()
[![tests](https://img.shields.io/badge/total%20tests-42-9cf)]()
[![client](https://img.shields.io/badge/client-react-blue)]()
[![client](https://img.shields.io/badge/server-django-success)]()

# E-books Fixer

E-books Fixer is a cloud-based web application for making epub files more accessible to visually impaired people. 
Its main focus is on automatically generating image descriptions using already existing AIs, such as the Google Vision API.
Our system also tries to keep the user in control as much as possible so all annotations generated by the AI can be 
manually edited and improved.

The project is part of the Future Libraries Lab, which is a research and innovation collaboration between the
National Library of the Netherlands (Koninklijke Bibliotheek) and the Web Information Systems Group at the
Delft University of Technology.

Here is a list with some of the most important features of our system:
* We convert valid ePub2 files into their more modern and accessible version - ePub3.
* Our graphical user interface allows the user to see all pages of the e-book, and we have also included buttons to
ease navigation through the pages / images.
* We allow users to download the book they are working on at any point of time with all the changes they have made so far.
* We are using a wide variety of AIs depending on the type of image, some of which consider not only the image itself
but also its surrounding context and thus improving the final description.

If you want to learn more about the topics of image annotation and accessibility of e-books here are some helpful links:
* [Image Description Guidelines](http://diagramcenter.org/table-of-contents-2.html)
* [Accessible Image Sample Book Webinar](http://diagramcenter.org/diagramwebinars.html#aisb)

## Technology Stack

* Client
  * Main framework: ``React``
  * Style library: ``eslint``
  * To see the list of all the libraries we used check ``package.json`` under the ``client`` directory.

* Server 
  * Main framework: ``Django``
  * Style library: ``flake8``
  * To see the list of all the libraries we used check ``requirements.txt`` under the ``server`` directory.

* External resources - the systems makes use of the Google Vision API to create image annotations
and the GitHub API to store the contents of the epub files (for research purposes).

## Installation

First, you need to [download the scripts](https://gitlab.ewi.tudelft.nl/cse2000-software-project/2021-2022-q4/cluster-00/fixing-e-books-with-image-description/fixing-e-books-with-image-description-for-visually-impaired-users/-/archive/main/fixing-e-books-with-image-description-for-visually-impaired-users-main.zip) 
or clone the repository.

To clone the repository using SSH run the following command in Git Bash.
```shell
git clone git@gitlab.ewi.tudelft.nl:cse2000-software-project/2021-2022-q4/cluster-00/fixing-e-books-with-image-description/fixing-e-books-with-image-description-for-visually-impaired-users.git path_to_local_directory
```

To clone the repository using HTTPS run the following command in Git Bash.
```shell
git clone https://gitlab.ewi.tudelft.nl/cse2000-software-project/2021-2022-q4/cluster-00/fixing-e-books-with-image-description/fixing-e-books-with-image-description-for-visually-impaired-users.git path_to_local_directory 
```

After that, the easiest way to build and run the app locally is to install [Docker](https://www.docker.com/) 
(you can find more information on how to do this [here](https://docs.docker.com/get-docker/)).

Next, open your terminal and navigate to the root of the project directory. You should also make sure that
Docker is running using this command.
```shell
docker info
```

Then, enter the following command to build and run the app. It might take a while the first time because of all the 
docker images and dependencies that are being installed.
```shell
docker-compose --env-file .env.development up --build -d
```

Once it is done, the client will be running on ``port 3000``, the server on ``port 8000``, and finally the 
MongoDB database on ``port 27017``. In your browser you can go to ``http://localhost:3000`` to start using the app.

## Contribution

To contribute to the project you should follow these guidelines:
* Open a new issue for the feature you want to implement and assign yourself to it (**Don't forget to add** a meaningful
description to the issue, following our template).
* Make use of isolated branches which will be later merged into ``development`` via merge requests.
* To ensure code quality you need at least 2 approvals on your merge requests for them to be merged.
* Make use of proper, descriptive commit messages and MR descriptions.
* Test your code thoroughly before committing the work. We try to keep the total test coverage at 70% or higher.
* Your MR can only be approved if the GitLab CI/CD pipeline passes. Also, make sure you run the tests and the style checkers
**before pushing** to ensure a passing pipeline. 

Use these commands to the run the tests (with coverage) locally.
* For the client:
```shell
 docker exec frontend npm test
```
* For the server:
```shell
docker exec backend coverage run manage.py test --failfast
docker exec backend coverage report 
```

Use these commands to run the style checkers locally.
* For the client:
```shell
docker exec frontend npx eslint .
```
* For the server:
```shell
docker exec backend flake8 --exclude=migrations --max-line-length 99 .
```

## Authors and acknowledgment

Thanks goes to the following people:

| 📸                                                                                                    | Name             | Email                            |
|-------------------------------------------------------------------------------------------------------|------------------|----------------------------------|
| ![](https://eu.ui-avatars.com/api/?name=AD&length=4&size=50&color=DDD&background=777&font-size=0.325) | Aratrika Das     | A.Das-12@student.tudelft.nl      |
| ![](https://eu.ui-avatars.com/api/?name=DT&length=4&size=50&color=DDD&background=777&font-size=0.325) | Denis Tsvetkov   | D.R.Tsvetkov@student.tudelft.nl  |
| ![](https://eu.ui-avatars.com/api/?name=FD&length=4&size=50&color=DDD&background=777&font-size=0.325) | Filip Nguyen Duc | H.C.NguyenDuc@student.tudelft.nl |
| ![](https://eu.ui-avatars.com/api/?name=NK&length=4&size=50&color=DDD&background=777&font-size=0.325) | Nadine Kuo       | H.N.Kuo@student.tudelft.nl       |
| ![](https://eu.ui-avatars.com/api/?name=VM&length=4&size=50&color=DDD&background=777&font-size=0.325) | Vlad Makarov     | V.Makarov@student.tudelft.nl     |

## License 

[KB](https://lab.kb.nl/terms-use)