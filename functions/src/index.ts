import * as functions from "firebase-functions";
import axios from 'axios';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

type PlayerDict = {
    [key:string]:Player,
};

type Player = {
    hashtag:string,
    depth_chart_position:number,
    status:string,
    sport:string,
    fantasy_positions:Array<string>,
    number:number,
    search_last_name:string,
    injury_start_date:string | null,
    weight:string,
    position:string,
    full_name:string,
    practice_participation:string | null,
    sportradar_id:string,
    team:string,
    last_name:string,
    college:string,
    fantasy_data_id:number,
    injury_status:string | null,
    player_id:string,
    height:string,
    search_full_name:string,
    imgLink:string,
    teamImgLink:string,
    age:number,
    stats_id:string,
    birth_country:string,
    espn_id:string,
    search_rank:number,
    first_name:string,
    depth_chart_order:number,
    years_exp:number,
    rotowire_id:string | null,
    rotoworld_id:string | null,
    search_first_name:string,
    yahoo_id:string | null
};

const serviceAccount = require('../sleeper-report-firebase-adminsdk-1ma6t-a75e15b53e.json');
const db = getFirestore(
    initializeApp({
        credential: cert(serviceAccount)
    })
);

const getPlayerDict = async () => {
    const { data } = await axios.get<PlayerDict>(
        'https://api.sleeper.app/v1/players/nfl',
        {
            headers: {
                Accept: 'application/json',
            },
        }
    );

    return data;
};

export const getPlayerInfo = functions
    .region('us-central1')
    .https
    .onCall(async (data, context) => {
        const playersResponse = await 
            Promise.all(
                data.playerIds.map((id:number) => db.collection('players').doc(`${id}`).get())
            );
        const players = playersResponse.map((p) => {
            if(p.exists) return p.data();
            return null;
        });

        return {
            players
        };
    });

export const dailyPullPlayers = functions
    .runWith(
        { 
            memory: "2GB",
            timeoutSeconds: 300,
        }
    )
    .pubsub
    .schedule('every 24 hours from 01:30 to 01:31')
    .timeZone('America/New_York')
    .onRun(async (context) => {
        functions.logger.log('running update');
        try {
            const players = await getPlayerDict();
            let batch = db.batch();
            let idx = 1;
            for (const playerId in players) {
                const player = players[playerId];
                batch.set(
                    db.collection('players').doc(`${playerId}`),
                    player
                );
                if(idx % 500 === 0) {
                    functions.logger.log('500 hit, committing and moving chunks');
                    await batch.commit();
                    batch = db.batch();
                }
                idx += 1;
            }
            await batch.commit();
        } catch(error) {
            if(axios.isAxiosError(error)) functions.logger.error(error.message);
            else functions.logger.error(error);
        }

        return null;
    });