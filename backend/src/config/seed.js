import dotenv from "dotenv";
import pg from "pg";

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const movies = [
  {
    title: "Interstellar",
    releaseYear: 2014,
    genre: "Sci-Fi",
    description:
      "A team of explorers travels through a wormhole in search of a new home for humanity.",
  },
  {
    title: "Inception",
    releaseYear: 2010,
    genre: "Sci-Fi",
    description:
      "A skilled extractor enters people's dreams to steal and plant information.",
  },
  {
    title: "The Dark Knight",
    releaseYear: 2008,
    genre: "Action",
    description:
      "Batman faces a criminal mastermind who pushes Gotham into chaos.",
  },
  {
    title: "The Shawshank Redemption",
    releaseYear: 1994,
    genre: "Drama",
    description:
      "A banker forms an unlikely friendship while serving a life sentence in prison.",
  },
  {
    title: "The Godfather",
    releaseYear: 1972,
    genre: "Crime",
    description:
      "The aging patriarch of a crime family transfers control of his empire to his son.",
  },
  {
    title: "Pulp Fiction",
    releaseYear: 1994,
    genre: "Crime",
    description:
      "Several interconnected stories unfold around criminals in Los Angeles.",
  },
  {
    title: "The Matrix",
    releaseYear: 1999,
    genre: "Sci-Fi",
    description:
      "A hacker discovers that reality is not what it appears to be.",
  },
  {
    title: "Parasite",
    releaseYear: 2019,
    genre: "Thriller",
    description:
      "A struggling family gradually becomes involved with a wealthy household.",
  },
  {
    title: "Whiplash",
    releaseYear: 2014,
    genre: "Drama",
    description:
      "A young drummer faces an intense instructor determined to push him to greatness.",
  },
  {
    title: "Avengers: Endgame",
    releaseYear: 2019,
    genre: "Action",
    description:
      "The Avengers attempt to reverse the devastating events that changed their universe.",
  },
  {
    title: "Dune",
    releaseYear: 2021,
    genre: "Sci-Fi",
    description:
      "A young noble becomes involved in a struggle over a valuable desert planet.",
  },
  {
    title: "Get Out",
    releaseYear: 2017,
    genre: "Horror",
    description:
      "A young man discovers disturbing secrets during a visit to his girlfriend's family.",
  },
  {
    title: "The Social Network",
    releaseYear: 2010,
    genre: "Drama",
    description:
      "The story of the creation and early growth of a major social networking platform.",
  },
  {
    title: "Mad Max: Fury Road",
    releaseYear: 2015,
    genre: "Action",
    description:
      "A group of survivors attempts to escape across a dangerous post-apocalyptic wasteland.",
  },

  {
    title: "Fight Club",
    releaseYear: 1999,
    genre: "Drama",
    description:
      "An insomniac office worker forms an underground fight club that evolves into something much bigger.",
  },
  {
    title: "Forrest Gump",
    releaseYear: 1994,
    genre: "Drama",
    description:
      "A kind-hearted man recounts his extraordinary life through decades of American history.",
  },
  {
    title: "The Prestige",
    releaseYear: 2006,
    genre: "Thriller",
    description:
      "Two rival magicians become consumed by their competition to create the ultimate illusion.",
  },
  {
    title: "Gladiator",
    releaseYear: 2000,
    genre: "Action",
    description:
      "A betrayed Roman general seeks justice against the emperor who destroyed his life.",
  },
  {
    title: "Titanic",
    releaseYear: 1997,
    genre: "Romance",
    description:
      "Two passengers from different social backgrounds fall in love aboard a doomed ocean liner.",
  },
  {
    title: "Jurassic Park",
    releaseYear: 1993,
    genre: "Adventure",
    description:
      "Scientists visit a dinosaur theme park where a security failure unleashes prehistoric creatures.",
  },
  {
    title: "The Lion King",
    releaseYear: 1994,
    genre: "Animation",
    description:
      "A young lion prince must reclaim his kingdom after a devastating betrayal.",
  },
  {
    title: "Toy Story",
    releaseYear: 1995,
    genre: "Animation",
    description:
      "A cowboy toy and a space ranger learn to coexist when a new toy arrives.",
  },
  {
    title: "Finding Nemo",
    releaseYear: 2003,
    genre: "Animation",
    description: "A clownfish crosses the ocean to find his missing son.",
  },
  {
    title: "Coco",
    releaseYear: 2017,
    genre: "Animation",
    description:
      "A young aspiring musician enters the Land of the Dead to uncover his family's history.",
  },
  {
    title: "Up",
    releaseYear: 2009,
    genre: "Animation",
    description:
      "An elderly widower travels to South America in a house lifted by balloons.",
  },
  {
    title: "Inside Out",
    releaseYear: 2015,
    genre: "Animation",
    description:
      "A young girl's emotions navigate the challenges of a major life change.",
  },
  {
    title: "Spider-Man: Into the Spider-Verse",
    releaseYear: 2018,
    genre: "Animation",
    description:
      "Miles Morales discovers his powers and encounters Spider-People from other dimensions.",
  },
  {
    title: "The Incredibles",
    releaseYear: 2004,
    genre: "Animation",
    description:
      "A family of superheroes returns to action while trying to live ordinary lives.",
  },
  {
    title: "Ratatouille",
    releaseYear: 2007,
    genre: "Animation",
    description:
      "A rat with exceptional taste helps a young chef pursue his culinary ambitions.",
  },
  {
    title: "Shrek",
    releaseYear: 2001,
    genre: "Animation",
    description:
      "An ogre sets out to rescue a princess to reclaim his peaceful swamp.",
  },
  {
    title: "The Truman Show",
    releaseYear: 1998,
    genre: "Drama",
    description:
      "A man begins questioning his seemingly perfect life and the world surrounding him.",
  },
  {
    title: "Good Will Hunting",
    releaseYear: 1997,
    genre: "Drama",
    description:
      "A gifted young janitor confronts his past with the help of a therapist.",
  },
  {
    title: "Dead Poets Society",
    releaseYear: 1989,
    genre: "Drama",
    description:
      "An unconventional English teacher inspires students to think independently and embrace poetry.",
  },
  {
    title: "The Green Mile",
    releaseYear: 1999,
    genre: "Drama",
    description:
      "A prison guard encounters a death-row inmate with extraordinary abilities.",
  },
  {
    title: "Schindler's List",
    releaseYear: 1993,
    genre: "Drama",
    description:
      "A businessman risks everything to save Jewish lives during the Holocaust.",
  },
  {
    title: "Saving Private Ryan",
    releaseYear: 1998,
    genre: "War",
    description:
      "A group of soldiers searches for a paratrooper behind enemy lines during World War II.",
  },
  {
    title: "Dunkirk",
    releaseYear: 2017,
    genre: "War",
    description:
      "Allied soldiers struggle to survive during the evacuation from Dunkirk.",
  },
  {
    title: "1917",
    releaseYear: 2019,
    genre: "War",
    description:
      "Two British soldiers race across enemy territory to deliver a critical message.",
  },
  {
    title: "The Departed",
    releaseYear: 2006,
    genre: "Crime",
    description:
      "An undercover cop and a criminal informant attempt to expose each other in Boston.",
  },
  {
    title: "Goodfellas",
    releaseYear: 1990,
    genre: "Crime",
    description:
      "A man rises through the ranks of organized crime and witnesses its consequences.",
  },
  {
    title: "Scarface",
    releaseYear: 1983,
    genre: "Crime",
    description:
      "A Cuban immigrant builds a drug empire in Miami at a devastating personal cost.",
  },
  {
    title: "Heat",
    releaseYear: 1995,
    genre: "Crime",
    description:
      "A determined detective pursues a professional thief planning one final major robbery.",
  },
  {
    title: "The Wolf of Wall Street",
    releaseYear: 2013,
    genre: "Crime",
    description:
      "A stockbroker's pursuit of wealth leads to excess, fraud, and a federal investigation.",
  },
  {
    title: "Se7en",
    releaseYear: 1995,
    genre: "Thriller",
    description:
      "Two detectives hunt a serial killer whose crimes are inspired by the seven deadly sins.",
  },
  {
    title: "Shutter Island",
    releaseYear: 2010,
    genre: "Thriller",
    description:
      "A federal marshal investigates a patient's disappearance from a remote psychiatric facility.",
  },
  {
    title: "Gone Girl",
    releaseYear: 2014,
    genre: "Thriller",
    description:
      "A woman's disappearance turns her marriage into a media spectacle and criminal investigation.",
  },
  {
    title: "Prisoners",
    releaseYear: 2013,
    genre: "Thriller",
    description:
      "A desperate father searches for his missing daughter as a detective investigates.",
  },
  {
    title: "The Silence of the Lambs",
    releaseYear: 1991,
    genre: "Thriller",
    description:
      "An FBI trainee seeks help from an imprisoned killer to catch another murderer.",
  },
  {
    title: "Psycho",
    releaseYear: 1960,
    genre: "Horror",
    description:
      "A motel encounter reveals the disturbing secrets of its mysterious owner.",
  },
  {
    title: "The Shining",
    releaseYear: 1980,
    genre: "Horror",
    description:
      "A caretaker and his family experience terrifying events at an isolated hotel.",
  },
  {
    title: "The Exorcist",
    releaseYear: 1973,
    genre: "Horror",
    description:
      "A mother seeks help when her daughter exhibits increasingly disturbing behavior.",
  },
  {
    title: "Hereditary",
    releaseYear: 2018,
    genre: "Horror",
    description:
      "A family uncovers disturbing secrets following the death of its secretive matriarch.",
  },
  {
    title: "A Quiet Place",
    releaseYear: 2018,
    genre: "Horror",
    description:
      "A family must remain silent to survive creatures that hunt by sound.",
  },
  {
    title: "The Conjuring",
    releaseYear: 2013,
    genre: "Horror",
    description:
      "Paranormal investigators help a family experiencing terrifying events in their farmhouse.",
  },
  {
    title: "Alien",
    releaseYear: 1979,
    genre: "Sci-Fi",
    description:
      "A spaceship crew faces a deadly extraterrestrial organism aboard their vessel.",
  },
  {
    title: "Blade Runner 2049",
    releaseYear: 2017,
    genre: "Sci-Fi",
    description:
      "A replicant detective uncovers a secret that could transform human society.",
  },
  {
    title: "Arrival",
    releaseYear: 2016,
    genre: "Sci-Fi",
    description:
      "A linguist attempts to communicate with mysterious extraterrestrial visitors.",
  },
  {
    title: "The Martian",
    releaseYear: 2015,
    genre: "Sci-Fi",
    description:
      "An astronaut stranded on Mars uses science and ingenuity to survive.",
  },
  {
    title: "Ex Machina",
    releaseYear: 2014,
    genre: "Sci-Fi",
    description:
      "A programmer evaluates an advanced artificial intelligence at a secluded research facility.",
  },
  {
    title: "Gravity",
    releaseYear: 2013,
    genre: "Sci-Fi",
    description:
      "Two astronauts fight to survive after an accident leaves them stranded in orbit.",
  },
  {
    title: "The Terminator",
    releaseYear: 1984,
    genre: "Sci-Fi",
    description:
      "A cyborg assassin travels through time to eliminate a woman destined to change humanity.",
  },
  {
    title: "Terminator 2: Judgment Day",
    releaseYear: 1991,
    genre: "Sci-Fi",
    description:
      "A reprogrammed terminator protects a young boy from a more advanced machine.",
  },
  {
    title: "Back to the Future",
    releaseYear: 1985,
    genre: "Sci-Fi",
    description:
      "A teenager travels to the past and must ensure his parents fall in love.",
  },
  {
    title: "2001: A Space Odyssey",
    releaseYear: 1968,
    genre: "Sci-Fi",
    description:
      "A mysterious artifact leads humanity toward a profound discovery about existence.",
  },
  {
    title: "The Grand Budapest Hotel",
    releaseYear: 2014,
    genre: "Comedy",
    description:
      "A legendary hotel concierge and his protégé become involved in a theft and inheritance dispute.",
  },
  {
    title: "Superbad",
    releaseYear: 2007,
    genre: "Comedy",
    description:
      "Two high school friends navigate an eventful night before graduation.",
  },
  {
    title: "Groundhog Day",
    releaseYear: 1993,
    genre: "Comedy",
    description:
      "A cynical weatherman repeatedly relives the same day in a small town.",
  },
  {
    title: "The Big Lebowski",
    releaseYear: 1998,
    genre: "Comedy",
    description:
      "A laid-back bowler becomes entangled in a bizarre kidnapping case.",
  },
  {
    title: "Home Alone",
    releaseYear: 1990,
    genre: "Comedy",
    description:
      "A boy accidentally left behind during a family trip defends his home from burglars.",
  },
  {
    title: "Mean Girls",
    releaseYear: 2004,
    genre: "Comedy",
    description:
      "A teenager navigates the social politics of an American high school.",
  },
  {
    title: "The Hangover",
    releaseYear: 2009,
    genre: "Comedy",
    description:
      "Three friends retrace a chaotic bachelor-party night to find the missing groom.",
  },
  {
    title: "Knives Out",
    releaseYear: 2019,
    genre: "Mystery",
    description:
      "A detective investigates a novelist's death amid a family full of suspects.",
  },
  {
    title: "Memento",
    releaseYear: 2000,
    genre: "Mystery",
    description:
      "A man with short-term memory loss investigates his wife's murder using notes and photographs.",
  },
  {
    title: "The Sixth Sense",
    releaseYear: 1999,
    genre: "Mystery",
    description:
      "A child psychologist helps a boy who claims to see dead people.",
  },
  {
    title: "Zodiac",
    releaseYear: 2007,
    genre: "Mystery",
    description:
      "Investigators and journalists become consumed by the hunt for the Zodiac Killer.",
  },
  {
    title: "The Usual Suspects",
    releaseYear: 1995,
    genre: "Mystery",
    description:
      "A survivor recounts the events leading to a deadly criminal operation.",
  },
  {
    title: "Casablanca",
    releaseYear: 1942,
    genre: "Romance",
    description:
      "A nightclub owner in wartime Morocco must choose between love and helping a resistance leader.",
  },
  {
    title: "Before Sunrise",
    releaseYear: 1995,
    genre: "Romance",
    description:
      "Two young travelers spend an unexpected night walking and talking through Vienna.",
  },
  {
    title: "Pride and Prejudice",
    releaseYear: 2005,
    genre: "Romance",
    description:
      "Elizabeth Bennet and Mr. Darcy navigate pride, misunderstandings, and growing affection.",
  },
  {
    title: "Eternal Sunshine of the Spotless Mind",
    releaseYear: 2004,
    genre: "Romance",
    description:
      "A former couple undergoes a procedure to erase memories of their relationship.",
  },
  {
    title: "La La Land",
    releaseYear: 2016,
    genre: "Romance",
    description:
      "An aspiring actress and a jazz musician pursue their dreams while falling in love.",
  },
  {
    title: "The Notebook",
    releaseYear: 2004,
    genre: "Romance",
    description:
      "A lifelong love story unfolds through memories of a couple from different backgrounds.",
  },
  {
    title: "The Avengers",
    releaseYear: 2012,
    genre: "Action",
    description: "Earth's mightiest heroes unite to stop an alien invasion.",
  },
  {
    title: "Iron Man",
    releaseYear: 2008,
    genre: "Action",
    description:
      "A billionaire inventor builds an advanced armored suit and becomes a superhero.",
  },
  {
    title: "Black Panther",
    releaseYear: 2018,
    genre: "Action",
    description:
      "A new king must protect Wakanda while confronting a challenge to his rule.",
  },
  {
    title: "Top Gun: Maverick",
    releaseYear: 2022,
    genre: "Action",
    description:
      "An experienced naval aviator trains elite pilots for a dangerous specialized mission.",
  },
  {
    title: "Mission: Impossible - Fallout",
    releaseYear: 2018,
    genre: "Action",
    description:
      "Ethan Hunt and his team race to prevent a global catastrophe.",
  },
  {
    title: "John Wick",
    releaseYear: 2014,
    genre: "Action",
    description:
      "A retired assassin returns to the criminal underworld after a personal tragedy.",
  },
  {
    title: "The Bourne Identity",
    releaseYear: 2002,
    genre: "Action",
    description:
      "A man with amnesia discovers extraordinary combat skills while uncovering his identity.",
  },
  {
    title: "Crouching Tiger, Hidden Dragon",
    releaseYear: 2000,
    genre: "Action",
    description:
      "Warriors pursue a stolen sword amid forbidden love and martial arts rivalries.",
  },
  {
    title: "Casino Royale",
    releaseYear: 2006,
    genre: "Action",
    description:
      "James Bond takes on a dangerous banker in a high-stakes poker game.",
  },
  {
    title: "The Lord of the Rings: The Fellowship of the Ring",
    releaseYear: 2001,
    genre: "Fantasy",
    description:
      "A hobbit begins a perilous journey to destroy a powerful and dangerous ring.",
  },
  {
    title: "The Lord of the Rings: The Two Towers",
    releaseYear: 2002,
    genre: "Fantasy",
    description:
      "The fellowship's members face separate dangers as a great battle approaches.",
  },
  {
    title: "The Lord of the Rings: The Return of the King",
    releaseYear: 2003,
    genre: "Fantasy",
    description:
      "The final struggle for Middle-earth unfolds as Frodo approaches Mount Doom.",
  },
  {
    title: "Harry Potter and the Philosopher's Stone",
    releaseYear: 2001,
    genre: "Fantasy",
    description:
      "A young wizard discovers his magical heritage and begins attending Hogwarts.",
  },
  {
    title: "Harry Potter and the Prisoner of Azkaban",
    releaseYear: 2004,
    genre: "Fantasy",
    description:
      "Harry learns more about his past while a dangerous prisoner escapes from Azkaban.",
  },
  {
    title: "Pan's Labyrinth",
    releaseYear: 2006,
    genre: "Fantasy",
    description:
      "A young girl discovers a mysterious fantasy world amid the brutality of postwar Spain.",
  },
  {
    title: "The Princess Bride",
    releaseYear: 1987,
    genre: "Fantasy",
    description:
      "A farmhand embarks on a daring adventure to rescue the woman he loves.",
  },
  {
    title: "The Wizard of Oz",
    releaseYear: 1939,
    genre: "Fantasy",
    description:
      "A young girl travels through a magical land searching for a way home.",
  },
  {
    title: "The Pianist",
    releaseYear: 2002,
    genre: "War",
    description:
      "A Jewish pianist struggles to survive the destruction of Warsaw during World War II.",
  },
  {
    title: "The Imitation Game",
    releaseYear: 2014,
    genre: "Drama",
    description:
      "Alan Turing and his colleagues work to decipher German wartime codes.",
  },
  {
    title: "Hidden Figures",
    releaseYear: 2016,
    genre: "Drama",
    description:
      "Three Black women mathematicians make vital contributions to the American space program.",
  },
  {
    title: "12 Angry Men",
    releaseYear: 1957,
    genre: "Drama",
    description:
      "A juror challenges the assumptions of eleven others during a murder trial deliberation.",
  },
  {
    title: "The Breakfast Club",
    releaseYear: 1985,
    genre: "Drama",
    description:
      "Five high school students from different social groups discover common ground during detention.",
  },
  {
    title: "Everything Everywhere All at Once",
    releaseYear: 2022,
    genre: "Sci-Fi",
    description:
      "A laundromat owner discovers that she must navigate multiple universes to save reality.",
  },
  {
    title: "Oppenheimer",
    releaseYear: 2023,
    genre: "Drama",
    description:
      "A physicist leads the Manhattan Project and confronts the consequences of developing the atomic bomb.",
  },
  {
    title: "The Batman",
    releaseYear: 2022,
    genre: "Action",
    description:
      "Batman investigates corruption in Gotham while pursuing a cryptic serial killer.",
  },
  {
    title: "Joker",
    releaseYear: 2019,
    genre: "Drama",
    description:
      "A troubled aspiring comedian descends into violence amid neglect and social inequality.",
  },
  {
    title: "The Revenant",
    releaseYear: 2015,
    genre: "Adventure",
    description:
      "An injured frontiersman fights to survive the wilderness and seek revenge.",
  },
  {
    title: "Life of Pi",
    releaseYear: 2012,
    genre: "Adventure",
    description:
      "A shipwreck survivor shares a remarkable journey across the Pacific with a Bengal tiger.",
  },
  {
    title: "The Pursuit of Happyness",
    releaseYear: 2006,
    genre: "Drama",
    description:
      "A struggling father works toward a better future while caring for his young son.",
  },
  {
    title: "Slumdog Millionaire",
    releaseYear: 2008,
    genre: "Drama",
    description:
      "A young man from Mumbai draws on his life experiences while competing on a quiz show.",
  },
  {
    title: "3 Idiots",
    releaseYear: 2009,
    genre: "Comedy",
    description:
      "Three engineering students challenge academic pressure and discover their own paths to success.",
  },
  {
    title: "Dangal",
    releaseYear: 2016,
    genre: "Drama",
    description:
      "A former wrestler trains his daughters to compete in wrestling despite social expectations.",
  },
  {
    title: "Gully Boy",
    releaseYear: 2019,
    genre: "Drama",
    description:
      "A young man from Mumbai's streets pursues his dream of becoming a rapper.",
  },
  {
    title: "Drishyam",
    releaseYear: 2013,
    genre: "Thriller",
    description:
      "A family man uses careful planning to protect his family after a crime.",
  },
  {
    title: "Kantara",
    releaseYear: 2022,
    genre: "Thriller",
    description:
      "A village guardian becomes entangled in a conflict involving tradition, land, and spiritual beliefs.",
  },
  {
    title: "RRR",
    releaseYear: 2022,
    genre: "Action",
    description:
      "Two revolutionaries form an extraordinary bond during India's struggle against colonial rule.",
  },
  {
    title: "Baahubali: The Beginning",
    releaseYear: 2015,
    genre: "Action",
    description:
      "A young man discovers his royal heritage and becomes involved in a kingdom's struggle.",
  },
  {
    title: "Zindagi Na Milegi Dobara",
    releaseYear: 2011,
    genre: "Comedy",
    description:
      "Three friends embark on a road trip across Spain that changes their perspectives on life.",
  },
  {
    title: "Queen",
    releaseYear: 2014,
    genre: "Comedy",
    description:
      "A young woman takes a solo honeymoon trip and discovers independence after her wedding is called off.",
  },
  {
    title: "Andhadhun",
    releaseYear: 2018,
    genre: "Thriller",
    description:
      "A pianist becomes entangled in a murder mystery involving deception and unexpected twists.",
  },
  {
    title: "Taare Zameen Par",
    releaseYear: 2007,
    genre: "Drama",
    description:
      "An art teacher helps a struggling child discover his talents and overcome learning difficulties.",
  },
];

const seedMovies = async () => {
  try {
    let insertedCount = 0;

    for (const movie of movies) {
      const result = await pool.query(
        `
          INSERT INTO movies (title, release_year, genre, description)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (title, release_year) DO NOTHING
        `,
        [movie.title, movie.releaseYear, movie.genre, movie.description],
      );

      insertedCount += result.rowCount;
    }

    console.log(
      `${insertedCount} new movies inserted. ${movies.length - insertedCount} already existed.`,
    );
  } catch (error) {
    console.error("Seeding failed:", error);
  } finally {
    await pool.end();
  }
};

seedMovies();
