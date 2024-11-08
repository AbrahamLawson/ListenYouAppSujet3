Listen You 👩‍🎤🎧 est une : 👇
API proposant une vaste pallette de chansons et de genre?
Prérequis
Avant de démarrer, assurez-vous que vous avez installé les outils suivants :

Python 3.8+
pip (gestionnaire de paquets Python)
virtualenv (optionnel mais recommandé pour isoler l'environnement de l'application)
Une base de données MySQL (ou SQLite pour développement❤️ rapide)
git (optionnel si vous clonez le projet)
Installation
Clonez le projet :

Si vous n'avez pas encore cloné le projet, faites-le avec la commande suivante :

bash
Copier le code
git clone https://votre-repository-url.git
cd votre-dossier-projet
Créer un environnement virtuel (optionnel mais recommandé) :

Si vous n'avez pas déjà créé un environnement virtuel, vous pouvez en créer un avec les commandes suivantes :

bash
Copier le code
python3 -m venv venv
source venv/bin/activate  # Sur MacOS/Linux
venv\Scripts\activate  # Sur Windows
Installer les dépendances :

Installez les dépendances requises pour l'application en utilisant pip :

bash
Copier le code
pip3 install -r requirements.txt

Configurer la base de données :

Si vous utilisez MySQL, assurez-vous d'avoir configuré votre base de données dans DATABASE_URL et que les informations sont correctes.
Si vous n'avez pas encore de base de données, créez-en une et assurez-vous qu'elle est prête à l'emploi.
Initialiser la base de données :


Configurer l'environnement virtuel Python :

cd back-end
python3 -m venv venv
source venv/bin/activate  (Sur Windows : venv\Scripts\activate)
pip install -r requirements.txt

Connexion à la base de données :

Assurez-vous que PostgreSQL est en cours d'exécution et récupérer les informations de connexion dans le fichier .env. Pour vous connecter à la base de données via le terminal :

psql -h <hôte> -U <utilisateur> -d <nom_de_la_base>

Lancer le backend Flask :

flask run --host=0.0.0.0 --port=5002

Lancer le frontend :
Dans un nouveau terminal, déplacez-vous dans le dossier front-end et exécutez :

npx http-server -p 8081

Utilisation

Notre interface Frontend via: http://localhost:8081.

Notre API Bakend via: http://localhost:5002.
