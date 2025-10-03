# Quiztopia API

Detta projekt min individuell examination där målet har varit att bygga ett serverless API för en quiz-applikation.
API:t är byggt med AWS Lambda, API Gateway, DynamoDB, JSON Web Tokens och Serverless Framework, med Middy som middleware-ramverk.
Även använt mig av CLoudWatch för att se vart det gått fel för att lättast åtgärda problemen.

Jag har arbetat med en single-table design i DynamoDB, där quiz, frågor, användare och scores lagras i samma tabell för att kunna query:a effektivt.
JWT används för autentisering och skydd av endpoints.
För VG-kravet har jag implementerat en leaderboard med hjälp av en Global Secondary Index, vilket gör att jag kan sortera användare efter högsta poäng för varje quiz.

För testning har jag använt Postman.
Där har jag byggt en collection med variabler för baseUrl, token, userId och quizId.
Token och ID:n fylls automatiskt på via scripts i Postman, så att alla efterföljande requests kan köras direkt utan att manuellt uppdatera headers eller body.
Exakt hur detta är uppsatt ser man också i min medföljande Postman-collection.

I mappen POSTMAN/ hittar du en färdig config-fil (quiztopia.postman_collection.json) för att enkelt kunna testa alla endpoints i API:t.
Eftersom att jag pratar så segt drog det över lite med tiden men du kan sätta videon på 1.5 i hastighet :)

Länk till inspelning: https://youtu.be/t9HPlvf8duA 

