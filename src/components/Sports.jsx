import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Grid, Paper, CircularProgress } from '@mui/material';
import axios from 'axios';
import { useStateContext } from './Header';
import { useNavigate } from 'react-router-dom';

const Sports = () => {
  const [newsItems, setNewsItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sideAd, setSideAd] = useState(null);
  const [bannerAd, setBannerAd] = useState(null);
  const [sideLoading, setSideLoading] = useState(true);
  const [bannerLoading, setBannerLoading] = useState(true);
  const [sideError, setSideError] = useState(null);
  const [bannerError, setBannerError] = useState(null);
  const { selectedState } = useStateContext();
  const navigate = useNavigate();
  
  const baseUrl = 'https://api.newztok.in';

  // Sport category keywords for filtering
  const sportKeywords = {
    cricket: [
      // Basic cricket terms - made more specific
      'cricket', 'ipl', 'test match', 'odi', 't20', 'bcci', 'wicket', 'cricket batting', 'cricket bowling', 'stumps', 'cricket run', 'cricket over', 'cricket innings',
      'batsman', 'bowler', 'cricket captain', 'century', 'fifty', 'sixes', 'fours', 'boundary', 'cricket six', 'cricket four', 'cricket ball', 'cricket pitch',
      'spinner', 'fast bowler', 'all-rounder', 'wicket keeper', 'cricket catch', 'lbw', 'cricket appeal', 'cricket umpire', 'cricket review', 'drs',
      'powerplay', 'death overs', 'maiden over', 'no ball', 'wide', 'bye', 'leg bye', 'stumping', 'run out', 'cricket partnership',
      'declaration', 'follow on', 'cricket draw', 'cricket win', 'cricket loss', 'cricket defeat', 'cricket victory', 'cricket champion', 'cricket trophy',
      
      // Test cricket and series
      'bgt', 'border gavaskar trophy', 'border-gavaskar trophy', 'test series', 'test cricket', 'cricket test match', 'day night test',
      'pink ball', 'red ball cricket', 'white ball cricket', 'first innings', 'second innings', 'third innings', 'fourth innings',
      'first day cricket', 'second day cricket', 'third day cricket', 'fourth day cricket', 'fifth day cricket', 'day 1 cricket', 'day 2 cricket', 'day 3 cricket', 'day 4 cricket', 'day 5 cricket',
      
      // Teams and matches - more specific
      'team india cricket', 'indian cricket team', 'men in blue', 'ind vs cricket', 'india vs cricket', 'vs india cricket', 'vs ind cricket',
      'australia vs india cricket', 'india vs australia cricket', 'aus vs ind cricket', 'ind vs aus cricket', 'india cricket tour', 'australia cricket tour',
      'england vs india cricket', 'india vs england cricket', 'eng vs ind cricket', 'ind vs eng cricket', 'pakistan vs india cricket', 'india vs pakistan cricket',
      'south africa vs india cricket', 'india vs south africa cricket', 'new zealand vs india cricket', 'india vs new zealand cricket',
      'west indies vs india cricket', 'india vs west indies cricket', 'sri lanka vs india cricket', 'india vs sri lanka cricket',
      
      // Indian cricket players (current and legends)
      'virat kohli', 'rohit sharma', 'hardik pandya', 'jasprit bumrah', 'mohammed shami', 'ravindra jadeja', 
      'ravichandran ashwin', 'rishabh pant', 'shubman gill', 'shreyas iyer', 'kl rahul', 'mohammed siraj',
      'kuldeep yadav', 'yuzvendra chahal', 'ishan kishan', 'suryakumar yadav', 'dinesh karthik', 'deepak chahar',
      'bhuvneshwar kumar', 'umesh yadav', 'shardul thakur', 'axar patel', 'washington sundar', 'tilak varma',
      'yashasvi jaiswal', 'ruturaj gaikwad', 'prithvi shaw', 'devdutt padikkal', 'mayank agarwal', 'cheteshwar pujara',
      'ajinkya rahane', 'hanuma vihari', 'sarfaraz khan', 'dhruv jurel', 'nitish kumar reddy', 'harshit rana',
      'virat cricket', 'rohit cricket', 'hardik cricket', 'bumrah cricket', 'shami cricket', 'jadeja cricket', 'ashwin cricket', 'pant cricket', 'gill cricket', 'iyer cricket', 'rahul cricket', 'siraj cricket',
      'kohli cricket', 'sharma cricket', 'pandya cricket', 'yadav cricket', 'chahal cricket', 'kishan cricket', 'suryakumar cricket', 'karthik cricket', 'chahar cricket', 'kumar cricket',
      
      // Cricket legends and past players
      'ms dhoni cricket', 'dhoni cricket', 'sachin tendulkar', 'sachin cricket', 'kapil dev cricket', 'sunil gavaskar cricket', 'rahul dravid cricket', 'dravid cricket',
      'sourav ganguly cricket', 'ganguly cricket', 'vvs laxman cricket', 'laxman cricket', 'anil kumble cricket', 'kumble cricket', 'zaheer khan cricket', 'harbhajan singh cricket',
      'yuvraj singh cricket', 'yuvraj cricket', 'sehwag cricket', 'virender sehwag cricket', 'gautam gambhir cricket', 'gambhir cricket', 'ishant sharma cricket', 'ishant cricket',
      
      // International cricket players (when playing against India or in IPL)
      'steve smith cricket', 'david warner cricket', 'pat cummins cricket', 'mitchell starc cricket', 'josh hazlewood cricket', 'nathan lyon cricket', 'travis head cricket',
      'marnus labuschagne cricket', 'cameron green cricket', 'alex carey cricket', 'usman khawaja cricket', 'mitchell marsh cricket', 'glenn maxwell cricket',
      'joe root cricket', 'ben stokes cricket', 'harry brook cricket', 'jonny bairstow cricket', 'jos buttler cricket', 'james anderson cricket', 'stuart broad cricket',
      'kane williamson cricket', 'trent boult cricket', 'tim southee cricket', 'babar azam cricket', 'shaheen afridi cricket', 'naseem shah cricket', 'mohammad rizwan cricket',
      'quinton de kock cricket', 'kagiso rabada cricket', 'anrich nortje cricket', 'temba bavuma cricket', 'kusal mendis cricket', 'wanindu hasaranga cricket',
      
      // IPL teams and related
      'csk', 'mi', 'rcb', 'kkr', 'dc', 'rr', 'pbks', 'srh', 'gt', 'lsg', 
      'mumbai indians', 'chennai super kings', 'royal challengers bangalore', 'kolkata knight riders', 
      'delhi capitals', 'rajasthan royals', 'punjab kings', 'sunrisers hyderabad', 'gujarat titans', 'lucknow super giants',
      'ipl franchise', 'ipl auction', 'ipl retained', 'ipl released', 'ipl squad', 'mega auction ipl', 'mini auction ipl', 'ipl 2024', 'ipl 2025',
      
      // Cricket stadiums in India
      'wankhede stadium', 'wankhede cricket', 'eden gardens cricket', 'eden cricket', 'm chinnaswamy stadium', 'chinnaswamy cricket', 'chepauk stadium', 'chepauk cricket',
      'kotla cricket', 'feroz shah kotla', 'arun jaitley stadium', 'sawai mansingh stadium cricket', 'sawai mansingh cricket', 'rajiv gandhi stadium cricket',
      'rajiv gandhi cricket', 'hyderabad cricket stadium', 'narendra modi stadium', 'narendra modi cricket', 'motera stadium', 'motera cricket', 'ahmedabad cricket stadium',
      'dharamsala cricket stadium', 'dharamsala cricket', 'himachal pradesh cricket association stadium', 'green park stadium cricket', 'green park cricket',
      'kanpur cricket stadium', 'barabati stadium cricket', 'barabati cricket', 'cuttack cricket stadium', 'holkar stadium cricket', 'holkar cricket', 'indore cricket stadium',
      'jsca stadium cricket', 'jsca cricket', 'ranchi cricket stadium', 'maharashtra cricket association stadium', 'mca stadium cricket', 'pune cricket stadium',
      'brabourne stadium cricket', 'brabourne cricket', 'mumbai cricket stadium', 'kolkata cricket stadium', 'bengaluru cricket stadium', 'bangalore cricket stadium',
      'chennai cricket stadium', 'delhi cricket stadium', 'jaipur cricket stadium', 'guwahati cricket stadium', 'thiruvananthapuram cricket stadium', 'kochi cricket stadium',
      'mohali cricket stadium', 'chandigarh cricket stadium', 'punjca stadium cricket', 'lucknow cricket stadium', 'ekana stadium cricket', 'ekana cricket',
      
      // International cricket stadiums (when India plays there)
      'mcg cricket', 'melbourne cricket ground', 'scg cricket', 'sydney cricket ground', 'adelaide oval cricket', 'gabba cricket', 'brisbane cricket', 'perth cricket stadium',
      'lords cricket', 'old trafford cricket', 'oval cricket', 'edgbaston cricket', 'headingley cricket', 'trent bridge cricket', 'wanderers cricket', 'centurion cricket', 'newlands cricket',
      'kingsmead cricket', 'galle cricket', 'colombo cricket', 'pallekele cricket', 'dubai cricket', 'sharjah cricket', 'abu dhabi cricket',
      
      // Cricket tournaments and series
      'cricket world cup', 'cwc', 'icc cricket world cup', 'icc champions trophy', 'cricket champions trophy',
      'world test championship', 'wtc', 'wtc final', 'asia cup cricket', 'icc cricket', 'ranji trophy', 'ranji cricket', 'vijay hazare trophy',
      'vijay hazare cricket', 'syed mushtaq ali trophy', 'syed mushtaq ali cricket', 'duleep trophy cricket', 'duleep cricket', 'irani cup cricket', 'irani cricket',
      'indian premier league', 'ipl match', 'ipl final', 'ipl playoff', 'ipl qualifier',
      'ipl eliminator', 'ipl playoffs', 'qualifier 1 ipl', 'qualifier 2 ipl', 'ipl opening ceremony', 'ipl closing ceremony',
      
      // Cricket formats
      'test cricket', 'one day cricket', 'twenty20 cricket', 't20i cricket', 'odi cricket', 'cricket test match', 'one day international cricket', 'twenty20 international cricket',
      'first class cricket', 'list a cricket', 'domestic cricket', 'international cricket', 'bilateral cricket series', 'tri series cricket',
      
      // Cricket terms and conditions
      'cricket rain', 'duckworth lewis', 'dls cricket', 'cricket weather', 'cricket pitch report', 'cricket toss', 'coin toss cricket', 'batting first cricket', 'bowling first cricket',
      'cricket target', 'required run rate cricket', 'net run rate cricket', 'nrr cricket', 'cricket points table', 'cricket standings', 'cricket qualification',
      'hat trick cricket', 'cricket maiden over', 'golden duck cricket', 'cricket duck', 'not out cricket', 'retired hurt cricket', 'cricket substitute', 'concussion substitute cricket',
      'impact player cricket', 'strategic timeout cricket', 'cricket timeout', 'drinks break cricket', 'lunch break cricket', 'tea break cricket', 'cricket stumps',
      
      // Cricket awards and records
      'man of the match cricket', 'mom cricket', 'man of the series cricket', 'purple cap ipl', 'orange cap ipl', 'fairplay award ipl', 'emerging player ipl',
      'most valuable player cricket', 'mvp cricket', 'player of the tournament cricket', 'best bowler cricket', 'best batsman cricket', 'highest score cricket',
      'fastest century cricket', 'fastest fifty cricket', 'most runs cricket', 'most wickets cricket', 'best figures cricket', 'cricket record', 'cricket milestone',
      'cricket debut', 'cricket farewell', 'cricket retirement', 'cricket comeback', 'cricket injury', 'cricket fitness', 'cricket form', 'cricket selection', 'cricket dropped'
    ],
    football: ['football', 'soccer', 'fifa', 'premier league', 'la liga', 'champions league', 'goal', 'penalty', 'striker', 'midfielder', 'defender', 'goalkeeper', 'messi', 'ronaldo', 'world cup football', 'uefa', 'el clasico', 'barcelona', 'real madrid', 'manchester'],
    tennis: ['tennis', 'wimbledon', 'us open tennis', 'french open', 'australian open', 'grand slam', 'serve', 'rally', 'ace', 'forehand', 'backhand', 'djokovic', 'nadal', 'federer', 'serena', 'atp', 'wta', 'singles', 'doubles', 'deuce'],
    'table tennis': [
      'table tennis', 'ping pong', 'tt', 'paddle', 'bat', 'table tennis ball', 'ping pong ball', 'table tennis table', 
      'table tennis tournament', 'table tennis championship', 'table tennis match', 'table tennis player', 'table tennis game',
      'table tennis competition', 'table tennis league', 'ittf', 'international table tennis federation', 'commonwealth games table tennis',
      'olympics table tennis', 'asian games table tennis', 'world table tennis championship', 'table tennis rankings',
      'sharath kamal', 'manika batra', 'sathiyan gnanasekaran', 'harmeet desai', 'archana kamath', 'ayhika mukherjee',
      'sutirtha mukherjee', 'sreeja akula', 'anthony amalraj', 'soumyajit ghosh', 'sanil shetty', 'manav thakkar',
      'table tennis spin', 'forehand loop', 'backhand loop', 'chop', 'block', 'smash', 'serve', 'return', 'rally'
    ],
    chess: [
      'chess', 'grandmaster', 'checkmate', 'chess world championship', 'fide', 'chess tournament', 'chess olympiad', 
      'viswanathan anand', 'magnus carlsen', 'chess master', 'chess game', 'chess match', 'chess competition', 
      'chess player', 'chess championship', 'international master', 'candidate master', 'elo rating', 'chess rating',
      'world chess championship', 'candidates tournament', 'chess olympiad', 'asian games chess', 'commonwealth games chess',
      'rapid chess', 'blitz chess', 'bullet chess', 'classical chess', 'correspondence chess', 'online chess',
      'chess opening', 'chess endgame', 'chess middlegame', 'chess strategy', 'chess tactics', 'chess puzzle',
      'king', 'queen', 'rook', 'bishop', 'knight', 'pawn', 'castling', 'en passant', 'promotion', 'draw',
      'stalemate', 'threefold repetition', 'fifty move rule', 'insufficient material', 'time control',
      'gukesh', 'praggnanandhaa', 'nihal sarin', 'raunak sadhwani', 'arjun erigaisi', 'pentala harikrishna',
      'koneru humpy', 'dronavalli harika', 'tania sachdev', 'bhakti kulkarni', 'soumya swaminathan',
      'garry kasparov', 'anatoly karpov', 'vladimir kramnik', 'boris spassky', 'mikhail tal', 'bobby fischer'
    ],
    volleyball: ['volleyball', 'spike', 'serve volleyball', 'volleyball tournament', 'volleyball championship', 'volleyball match', 'volleyball team', 'volleyball player', 'volleyball game', 'volleyball competition', 'net volleyball', 'volleyball court', 'volleyball league'],
    boxing: ['boxing', 'boxer', 'knockout', 'punch', 'heavyweight', 'lightweight', 'middleweight', 'boxing match', 'boxing championship', 'boxing tournament', 'boxing ring', 'boxing gloves', 'boxing competition', 'boxing fight', 'boxing player', 'boxing game'],
    basketball: ['basketball', 'nba', 'dunk', 'three pointer', 'basketball match', 'basketball game', 'basketball tournament', 'basketball championship', 'basketball player', 'basketball team', 'basketball court', 'basketball league'],
    badminton: ['badminton', 'shuttlecock', 'badminton match', 'badminton tournament', 'badminton championship', 'badminton player', 'badminton game', 'badminton competition', 'badminton court', 'badminton racket'],
    hockey: ['hockey', 'field hockey', 'hockey match', 'hockey tournament', 'hockey championship', 'hockey player', 'hockey team', 'hockey game', 'hockey competition', 'hockey stick', 'hockey goal']
  };

  // Function to filter news by sport category with strict cricket filtering
  const filterNewsBySport = (news, sport) => {
    if (!news || !Array.isArray(news)) return [];
    
    const keywords = sportKeywords[sport.toLowerCase()] || [];
    if (keywords.length === 0) return news; // Return all if no keywords defined
    
    // For cricket, use strict filtering with comprehensive exclusions
    if (sport.toLowerCase() === 'cricket') {
      return news.filter(item => {
        const title = (item.title || '').toLowerCase();
        const content = (item.content || '').toLowerCase();
        const category = (item.category || '').toLowerCase();
        const subcategory = (item.subcategory || '').toLowerCase();
        
        // STEP 1: Comprehensive exclusion check - if any of these match, immediately exclude
        const nonCricketSportsTerms = [
          // Shooting & Archery - most comprehensive
          'shooting', 'shooter', 'archery', 'archer', 'rifle', 'pistol', 'gun', 'target shooting',
          'निशानेबाजी', 'शूटिंग', 'तीरंदाजी', 'राइफल', 'पिस्टल', 'विशानेबाजी', 'शूटर', 
          'निशानेबाज़ी', 'निशानेबाज', 'शूटिंग गोल्ड', 'शूटिंग रजत', 'शूटिंग कांस्य', 
          'शूटिंग पदक', 'निशानेबाजी पदक', 'olympic shooting', 'shooting competition', 
          'shooting tournament', 'shooting championship', 'air rifle', 'air pistol', 
          'trap shooting', 'skeet shooting', 'clay pigeon shooting', 'shooting range', 
          'firing range', 'bullet', 'ammunition', 'scope', 'trigger', 'एयर राइफल', 
          'एयर पिस्टल', 'गोली', 'गोलीबारी', 'फायरिंग', 'तीर', 'धनुष', 'arrow', 'bow',
          
          // Table Tennis
          'table tennis', 'ping pong', 'paddle', 'tt tournament', 'ittf', 'टेबल टेनिस', 'पिंग पॉन्ग',
          
          // Chess
          'chess', 'grandmaster', 'checkmate', 'chess tournament', 'chess championship', 'chess match',
          'शतरंज', 'चेस', 'ग्रैंडमास्टर', 'चेस टूर्नामेंट', 'चेस चैंपियनशिप',
          
          // Other sports
          'football', 'soccer', 'fifa', 'goal', 'penalty', 'striker', 'midfielder', 'defender', 'goalkeeper',
          'फुटबॉल', 'सॉकर', 'गोल', 'पेनल्टी', 'स्ट्राइकर', 'मिडफील्डर', 'डिफेंडर', 'गोलकीपर',
          'tennis', 'wimbledon', 'grand slam', 'serve tennis', 'rally tennis', 'ace tennis', 'atp', 'wta',
          'टेनिस', 'विम्बलडन', 'ग्रैंड स्लैम', 'टेनिस सर्व', 'टेनिस रैली',
          'volleyball', 'spike volleyball', 'volleyball tournament', 'volleyball championship',
          'वॉलीबॉल', 'वॉलीबॉल टूर्नामेंट', 'वॉलीबॉल चैंपियनशिप',
          'boxing', 'boxer', 'knockout', 'punch', 'heavyweight', 'lightweight', 'middleweight',
          'बॉक्सिंग', 'बॉक्सर', 'नॉकआउट', 'पंच', 'मुक्केबाजी',
          'basketball', 'nba', 'dunk', 'three pointer', 'basketball tournament',
          'बास्केटबॉल', 'डंक', 'थ्री पॉइंटर', 'बास्केटबॉल टूर्नामेंट',
          'badminton', 'shuttlecock', 'badminton tournament', 'badminton championship',
          'बैडमिंटन', 'शटलकॉक', 'बैडमिंटन टूर्नामेंट', 'बैडमिंटन चैंपियनशिप',
          'hockey', 'field hockey', 'hockey tournament', 'hockey championship',
          'हॉकी', 'फील्ड हॉकी', 'हॉकी टूर्नामेंट', 'हॉकी चैंपियनशिप',
          'wrestling', 'wrestler', 'kushti', 'कुश्ती', 'पहलवान', 'रेसलिंग',
          'athletics', 'track and field', 'marathon', 'running', 'sprint', 'javelin', 'discus', 'shot put',
          'एथलेटिक्स', 'ट्रैक एंड फील्ड', 'मैराथन', 'दौड़', 'स्प्रिंट', 'भाला फेंक', 'चक्का फेंक',
          'swimming', 'swimmer', 'backstroke', 'freestyle', 'butterfly', 'breaststroke',
          'तैराकी', 'स्विमिंग', 'तैराक', 'बैकस्ट्रोक', 'फ्रीस्टाइल',
          'weightlifting', 'powerlifting', 'weightlifter', 'भारोत्तोलन', 'वेटलिफ्टिंग',
          'kabaddi', 'कबड्डी', 'pro kabaddi', 'पीकेएल',
          'martial arts', 'karate', 'judo', 'taekwondo', 'मार्शल आर्ट', 'कराटे', 'जूडो'
        ];
        
        // Check if any exclusion term matches
        const hasExcludedContent = nonCricketSportsTerms.some(exclusion => {
          const exclusionLower = exclusion.toLowerCase();
          const matchesTitle = title.includes(exclusionLower);
          const matchesContent = content.includes(exclusionLower);
          const matchesCategory = category.includes(exclusionLower);
          const matchesSubcategory = subcategory.includes(exclusionLower);
          
          const hasMatch = matchesTitle || matchesContent || matchesCategory || matchesSubcategory;
          
          if (hasMatch) {
            console.log(`🚫 EXCLUDED from cricket: "${title.substring(0, 100)}..." - Matched exclusion: "${exclusion}"`);
          }
          
          return hasMatch;
        });
        
        if (hasExcludedContent) {
          return false; // Exclude this item from cricket
        }
        
        // STEP 2: Check for strong cricket evidence
        const strongCricketKeywords = [
          'cricket', 'ipl', 'test match', 'odi', 't20', 'bcci', 'wicket', 'batsman', 'bowler',
          'virat kohli', 'rohit sharma', 'ms dhoni', 'hardik pandya', 'jasprit bumrah',
          'mumbai indians', 'chennai super kings', 'royal challengers bangalore', 'kolkata knight riders',
          'delhi capitals', 'rajasthan royals', 'punjab kings', 'sunrisers hyderabad',
          'ind vs aus', 'india vs australia', 'border gavaskar trophy', 'bgt',
          'wankhede stadium', 'eden gardens', 'chinnaswamy stadium', 'chepauk stadium',
          'cricket world cup', 'world test championship', 'wtc', 'asia cup cricket',
          'ranji trophy', 'ipl auction', 'ipl match', 'ipl final'
        ];
        
        const hasStrongCricketMatch = strongCricketKeywords.some(keyword => {
          const keywordLower = keyword.toLowerCase();
          const matchesTitle = title.includes(keywordLower);
          const matchesContent = content.includes(keywordLower);
          const matchesCategory = category.includes(keywordLower);
          const matchesSubcategory = subcategory.includes(keywordLower);
          
          const hasMatch = matchesTitle || matchesContent || matchesCategory || matchesSubcategory;
          
          if (hasMatch) {
            console.log(`✅ STRONG CRICKET MATCH: "${title.substring(0, 100)}..." - Matched keyword: "${keyword}"`);
          }
          
          return hasMatch;
        });
        
        // STEP 3: If no strong cricket match, check for weaker indicators but be more cautious
        if (!hasStrongCricketMatch) {
          const weakCricketKeywords = [
            'team india', 'indian team', 'men in blue', 'captain', 'batting', 'bowling',
            'runs', 'score', 'match', 'series', 'tournament', 'championship'
          ];
          
          const hasWeakCricketMatch = weakCricketKeywords.some(keyword => {
            const keywordLower = keyword.toLowerCase();
            const matchesTitle = title.includes(keywordLower);
            const matchesContent = content.includes(keywordLower);
            
            const hasMatch = matchesTitle || matchesContent;
            
            if (hasMatch) {
              console.log(`⚠️  WEAK CRICKET MATCH: "${title.substring(0, 100)}..." - Matched keyword: "${keyword}"`);
            }
            
            return hasMatch;
          });
          
          // For weak matches, require additional validation
          if (hasWeakCricketMatch) {
            // Check if it's likely about cricket by looking for additional context
            const cricketContextWords = [
              'ball', 'over', 'innings', 'pitch', 'stadium', 'ground', 'field',
              'player', 'sport', 'game', 'win', 'loss', 'victory', 'defeat'
            ];
            
            const hasContext = cricketContextWords.some(context => 
              title.includes(context.toLowerCase()) || content.includes(context.toLowerCase())
            );
            
            if (hasContext) {
              console.log(`✅ WEAK CRICKET ACCEPTED with context: "${title.substring(0, 100)}..."`);
              return true;
            } else {
              console.log(`🚫 WEAK CRICKET REJECTED (no context): "${title.substring(0, 100)}..."`);
              return false;
            }
          }
          
          return false; // No cricket match found
        }
        
        return true; // Strong cricket match found
      });
    }
    
    // For chess, use strict filtering with comprehensive exclusions
    if (sport.toLowerCase() === 'chess') {
      return news.filter(item => {
        const title = (item.title || '').toLowerCase();
        const content = (item.content || '').toLowerCase();
        const category = (item.category || '').toLowerCase();
        const subcategory = (item.subcategory || '').toLowerCase();
        
        // STEP 1: Comprehensive exclusion check - if any of these match, immediately exclude
        const nonChessSportsTerms = [
          // Cricket terms
          'cricket', 'ipl', 'test match', 'odi', 't20', 'bcci', 'wicket', 'batsman', 'bowler',
          'virat kohli', 'rohit sharma', 'ms dhoni', 'hardik pandya', 'jasprit bumrah',
          'mumbai indians', 'chennai super kings', 'royal challengers bangalore', 'kolkata knight riders',
          'delhi capitals', 'rajasthan royals', 'punjab kings', 'sunrisers hyderabad',
          'ind vs aus', 'india vs australia', 'border gavaskar trophy', 'bgt',
          'wankhede stadium', 'eden gardens', 'chinnaswamy stadium', 'chepauk stadium',
          'cricket world cup', 'world test championship', 'wtc', 'asia cup cricket',
          'ranji trophy', 'ipl auction', 'ipl match', 'ipl final',
          
          // Shooting & Archery
          'shooting', 'shooter', 'archery', 'archer', 'rifle', 'pistol', 'gun', 'target shooting',
          'निशानेबाजी', 'शूटिंग', 'तीरंदाजी', 'राइफल', 'पिस्टल', 'विशानेबाजी', 'शूटर', 
          'निशानेबाज़ी', 'निशानेबाज', 'शूटिंग गोल्ड', 'शूटिंग रजत', 'शूटिंग कांस्य', 
          'शूटिंग पदक', 'निशानेबाजी पदक', 'olympic shooting', 'shooting competition', 
          'shooting tournament', 'shooting championship', 'air rifle', 'air pistol', 
          'trap shooting', 'skeet shooting', 'clay pigeon shooting', 'shooting range', 
          'firing range', 'bullet', 'ammunition', 'scope', 'trigger', 'एयर राइफल', 
          'एयर पिस्टल', 'गोली', 'गोलीबारी', 'फायरिंग', 'तीर', 'धनुष', 'arrow', 'bow',
          
          // Table Tennis
          'table tennis', 'ping pong', 'paddle', 'tt tournament', 'ittf', 'टेबल टेनिस', 'पिंग पॉन्ग',
          
          // Other sports
          'football', 'soccer', 'fifa', 'goal', 'penalty', 'striker', 'midfielder', 'defender', 'goalkeeper',
          'फुटबॉल', 'सॉकर', 'गोल', 'पेनल्टी', 'स्ट्राइकर', 'मिडफील्डर', 'डिफेंडर', 'गोलकीपर',
          'tennis', 'wimbledon', 'grand slam', 'serve tennis', 'rally tennis', 'ace tennis', 'atp', 'wta',
          'टेनिस', 'विम्बलडन', 'ग्रैंड स्लैम', 'टेनिस सर्व', 'टेनिस रैली',
          'volleyball', 'spike volleyball', 'volleyball tournament', 'volleyball championship',
          'वॉलीबॉल', 'वॉलीबॉल टूर्नामेंट', 'वॉलीबॉल चैंपियनशिप',
          'boxing', 'boxer', 'knockout', 'punch', 'heavyweight', 'lightweight', 'middleweight',
          'बॉक्सिंग', 'बॉक्सर', 'नॉकआउट', 'पंच', 'मुक्केबाजी',
          'basketball', 'nba', 'dunk', 'three pointer', 'basketball tournament',
          'बास्केटबॉल', 'डंक', 'थ्री पॉइंटर', 'बास्केटबॉल टूर्नामेंट',
          'badminton', 'shuttlecock', 'badminton tournament', 'badminton championship',
          'बैडमिंटन', 'शटलकॉक', 'बैडमिंटन टूर्नामेंट', 'बैडमिंटन चैंपियनशिप',
          'hockey', 'field hockey', 'hockey tournament', 'hockey championship',
          'हॉकी', 'फील्ड हॉकी', 'हॉकी टूर्नामेंट', 'हॉकी चैंपियनशिप',
          'wrestling', 'wrestler', 'kushti', 'कुश्ती', 'पहलवान', 'रेसलिंग',
          'athletics', 'track and field', 'marathon', 'running', 'sprint', 'javelin', 'discus', 'shot put',
          'एथलेटिक्स', 'ट्रैक एंड फील्ड', 'मैराथन', 'दौड़', 'स्प्रिंट', 'भाला फेंक', 'चक्का फेंक',
          'swimming', 'swimmer', 'backstroke', 'freestyle', 'butterfly', 'breaststroke',
          'तैराकी', 'स्विमिंग', 'तैराक', 'बैकस्ट्रोक', 'फ्रीस्टाइल',
          'weightlifting', 'powerlifting', 'weightlifter', 'भारोत्तोलन', 'वेटलिफ्टिंग',
          'kabaddi', 'कबड्डी', 'pro kabaddi', 'पीकेएल',
          'martial arts', 'karate', 'judo', 'taekwondo', 'मार्शल आर्ट', 'कराटे', 'जूडो'
        ];
        
        // Check if any exclusion term matches
        const hasExcludedContent = nonChessSportsTerms.some(exclusion => {
          const exclusionLower = exclusion.toLowerCase();
          const matchesTitle = title.includes(exclusionLower);
          const matchesContent = content.includes(exclusionLower);
          const matchesCategory = category.includes(exclusionLower);
          const matchesSubcategory = subcategory.includes(exclusionLower);
          
          const hasMatch = matchesTitle || matchesContent || matchesCategory || matchesSubcategory;
          
          if (hasMatch) {
            console.log(`🚫 EXCLUDED from chess: "${title.substring(0, 100)}..." - Matched exclusion: "${exclusion}"`);
          }
          
          return hasMatch;
        });
        
        if (hasExcludedContent) {
          return false; // Exclude this item from chess
        }
        
        // STEP 2: Check for strong chess evidence
        const strongChessKeywords = [
          'chess', 'शतरंज', 'चेस', 'grandmaster', 'ग्रैंडमास्टर', 'checkmate', 'चेकमेट',
          'chess tournament', 'चेस टूर्नामेंट', 'chess championship', 'चेस चैंपियनशिप',
          'chess match', 'चेस मैच', 'chess game', 'चेस गेम', 'chess player', 'चेस खिलाड़ी',
          'viswanathan anand', 'विश्वनाथन आनंद', 'vishwanathan anand', 'anand chess',
          'gukesh', 'गुकेश', 'praggnanandhaa', 'प्रज्ञानंदा', 'pragg', 'प्रग्ग',
          'arjun erigaisi', 'अर्जुन एरिगैसी', 'nihal sarin', 'निहाल सरीन',
          'pentala harikrishna', 'पेंटाला हरिकृष्ण', 'koneru humpy', 'कोनेरू हम्पी',
          'world chess championship', 'विश्व शतरंज चैंपियनशिप', 'chess olympiad', 'चेस ओलिंपियाड',
          'fide', 'फाइड', 'elo rating', 'एलो रेटिंग', 'chess rating', 'चेस रेटिंग',
          'chess board', 'चेस बोर्ड', 'chess piece', 'चेस पीस', 'chess king', 'चेस राजा',
          'chess queen', 'चेस रानी', 'chess pawn', 'चेस प्यादा', 'chess knight', 'चेस घोड़ा',
          'chess bishop', 'चेस ऊंट', 'chess rook', 'चेस रूक', 'chess castle', 'चेस कैसल'
        ];
        
        const hasStrongChessMatch = strongChessKeywords.some(keyword => {
          const keywordLower = keyword.toLowerCase();
          const matchesTitle = title.includes(keywordLower);
          const matchesContent = content.includes(keywordLower);
          const matchesCategory = category.includes(keywordLower);
          const matchesSubcategory = subcategory.includes(keywordLower);
          
          const hasMatch = matchesTitle || matchesContent || matchesCategory || matchesSubcategory;
          
          if (hasMatch) {
            console.log(`✅ STRONG CHESS MATCH: "${title.substring(0, 100)}..." - Matched keyword: "${keyword}"`);
          }
          
          return hasMatch;
        });
        
        return hasStrongChessMatch;
      });
    }
    
    // For other sports, use original filtering logic
    return news.filter(item => {
      const title = (item.title || '').toLowerCase();
      const content = (item.content || '').toLowerCase();
      const category = (item.category || '').toLowerCase();
      const subcategory = (item.subcategory || '').toLowerCase();
      
      // Check if any keyword matches in title, content, category, or subcategory
      const hasKeywordMatch = keywords.some(keyword => {
        const keywordLower = keyword.toLowerCase();
        const matchesTitle = title.includes(keywordLower);
        const matchesContent = content.includes(keywordLower);
        const matchesCategory = category.includes(keywordLower);
        const matchesSubcategory = subcategory.includes(keywordLower);
        
        return matchesTitle || matchesContent || matchesCategory || matchesSubcategory;
      });
      
      return hasKeywordMatch;
    });
  };

  // Function to get general sports news (excluding specific sports)
  const getGeneralSportsNews = (news) => {
    if (!news || !Array.isArray(news)) return [];
    
    const allSportKeywords = Object.values(sportKeywords).flat();
    
    return news.filter(item => {
      const title = (item.title || '').toLowerCase();
      const content = (item.content || '').toLowerCase();
      
      // Return news that doesn't match any specific sport keywords
      return !allSportKeywords.some(keyword => 
        title.includes(keyword.toLowerCase()) || 
        content.includes(keyword.toLowerCase())
      );
    });
  };

  // Function to sort news by date (most recent first)
  const sortNewsByDate = (news) => {
    if (!news || !Array.isArray(news)) return [];
    
    return [...news].sort((a, b) => {
      // Try multiple date field variations
      const getDateFromItem = (item) => {
        const possibleDateFields = [
          'created_at', 'createdAt', 'publishedAt', 'published_at', 
          'updatedAt', 'updated_at', 'date', 'timestamp', 'time',
          'datePublished', 'pubDate', 'dateCreated'
        ];
        
        for (const field of possibleDateFields) {
          if (item[field]) {
            const date = new Date(item[field]);
            if (!isNaN(date.getTime())) {
              return date;
            }
          }
        }
        
        // If no valid date found, return epoch time (very old date)
        return new Date(0);
      };
      
      const dateA = getDateFromItem(a);
      const dateB = getDateFromItem(b);
      
      // Most recent first (descending order)
      const dateDiff = dateB.getTime() - dateA.getTime();
      
      // If dates are the same, sort by ID (higher ID = more recent)
      if (dateDiff === 0) {
        const idA = parseInt(a.id || 0);
        const idB = parseInt(b.id || 0);
        return idB - idA; // Higher ID first
      }
      
      return dateDiff;
    });
  };

  useEffect(() => {
    fetchSportsNews();
    fetchSideAd();
    fetchBannerAd();
  }, [selectedState]);

  const fetchSportsNews = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('https://api.newztok.in/api/news/category/sports');
      console.log('Sports news API response:', response.data);
      
      let fetchedNews = [];
      if (Array.isArray(response.data)) {
        fetchedNews = response.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        fetchedNews = response.data.data;
      } else if (response.data && response.data.posts && Array.isArray(response.data.posts)) {
        fetchedNews = response.data.posts;
      } else {
        console.warn('Unexpected API response structure:', response.data);
        setError('Unexpected data format received from server');
        fetchedNews = [];
      }
      
      // Filter news by selected state if one is selected
      if (selectedState) {
        console.log(`Filtering sports news by state: ${selectedState}`);
        
        let filteredNews = fetchedNews.filter(item => 
          item.state && (item.state.includes(selectedState) || selectedState.includes(item.state))
        );
        
        if (filteredNews.length === 0) {
          filteredNews = fetchedNews.filter(item => 
            (item.content && item.content.includes(selectedState)) || 
            (item.title && item.title.includes(selectedState))
          );
        }
        
        if (filteredNews.length > 0) {
          console.log(`Found ${filteredNews.length} sports news items for state: ${selectedState}`);
          fetchedNews = filteredNews;
        } else {
          console.log(`No sports news items found for state: ${selectedState}, showing all sports news`);
        }
      }
      
      setNewsItems(fetchedNews);
    } catch (err) {
      console.error('Error fetching sports news:', err);
      if (err.response) {
        setError(`Server error (${err.response.status}): ${err.response.data.message || 'Unable to fetch news'}`);
      } else if (err.request) {
        setError('Network error: No response from server. Please check your connection.');
      } else {
        setError(`Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchSideAd = async () => {
    try {
      setSideLoading(true);
      setSideError(null);
      const response = await axios.get(`${baseUrl}/api/ads/public/web/side`);
      if (response.data && response.data.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
        setSideAd(response.data.data[0]);
      } else {
        setSideError('No ads available');
      }
    } catch (err) {
      console.error('Error fetching side ad:', err);
      setSideError(err.message || 'Failed to load advertisement');
    } finally {
      setSideLoading(false);
    }
  };

  const fetchBannerAd = async () => {
    try {
      setBannerLoading(true);
      setBannerError(null);
      const response = await axios.get(`${baseUrl}/api/ads/public/web/banner`);
      if (response.data && response.data.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
        setBannerAd(response.data.data[0]);
      } else {
        setBannerError('No ads available');
      }
    } catch (err) {
      console.error('Error fetching banner ad:', err);
      setBannerError(err.message || 'Failed to load advertisement');
    } finally {
      setBannerLoading(false);
    }
  };

  // Convert news data to video format for NewsCard
  const convertNewsToVideoFormat = (news) => {
    const hasVideo = news.hasVideo || news.video || news.videoPath || 
                    (news.featuredImage && news.featuredImage.includes('/uploads/videos/video-')) ||
                    (news.image && news.image.includes('/uploads/videos/video-'));
    
    return {
      image: getImageUrl(news),
      title: news.title,
      timestamp: formatDate(news.createdAt || news.publishedAt || news.updatedAt),
      time: formatTime(news.createdAt || news.publishedAt || news.updatedAt),
      isVideo: hasVideo,
      id: news.id,
      category: news.category || 'SPORTS'
    };
  };

  // Convert news data to trending format
  const convertNewsToTrendingFormat = (news) => ({
    image: getImageUrl(news),
    title: news.title,
    date: formatDate(news.createdAt || news.publishedAt || news.updatedAt),
    id: news.id
  });

  // Get image URL with proper handling
  const getImageUrl = (item) => {
    if (item.youtubeUrl) {
      const youtubeRegex = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
      const match = item.youtubeUrl.match(youtubeRegex);
      if (match && match[1]) {
        return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
      }
    }
    
    if (item.images && item.images.length > 0) {
      return item.images[0];
    }
    
    if (item.featuredImage && !item.featuredImage.includes('/uploads/videos/video-')) {
      return item.featuredImage.startsWith('http') ? item.featuredImage : `${baseUrl}${item.featuredImage}`;
    }
    
    if (item.image && !item.image.includes('/uploads/videos/video-')) {
      return item.image.startsWith('http') ? item.image : `${baseUrl}${item.image}`;
    }
    
    return 'https://placehold.co/800x400/2E7D32/FFFFFF/png?text=Sports+News';
  };

  // Format date function
    const formatDate = (dateString) => {
    if (!dateString) return 'Recent';
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
          day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (err) {
      return 'Recent';
    }
  };

  // Format time function
  const formatTime = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      });
    } catch (err) {
      return '';
    }
  };

  // Capitalize first letter
  const capitalizeFirstLetter = (string) => {
    if (!string) return '';
    return string
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // NewsCard component
  const NewsCard = ({ image, title, timestamp, isVideo = false, id, category }) => {
    const [imageError, setImageError] = useState(false);
    
    const handleClick = () => {
      navigate(`/sports/${id}`);
    };

    return (
      <Box 
        sx={{ 
          width: '528.82px', 
          height: '480px', 
          bgcolor: '#fff', 
          borderRadius: 2,
          boxShadow: 1, 
          overflow: 'hidden',
          cursor: 'pointer',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: 3
          }
        }}
        onClick={handleClick}
      >
        {/* Title Section - 25% height */}
        <Box sx={{ height: '25%', p: 2, display: 'flex', alignItems: 'center' }}>
          <Typography
            sx={{
              fontSize: '1.1rem', 
              fontWeight: '700', 
              color: '#222', 
              lineHeight: 1.3,
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical'
            }}
          >
            {title}
          </Typography>
        </Box>

        {/* Media Section - 55% height */}
        <Box sx={{ height: '55%', position: 'relative' }}>
          {!imageError ? (
            <Box
              component="img"
              src={image}
              alt={title}
              onError={() => setImageError(true)}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          ) : (
            <Box
              sx={{
                width: '100%',
                height: '100%',
                backgroundColor: '#f0f0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#999'
              }}
            >
              Sports News
            </Box>
          )}
          
          {isVideo && (
            <Box
              sx={{
                position: 'absolute',
                top: 8,
                left: 8,
                backgroundColor: '#FF0000',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5
              }}
            >
              <Box component="span">▶</Box>
              VIDEO
            </Box>
          )}
          
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: '#2E7D32',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '0.75rem',
              fontWeight: 'bold',
              textTransform: 'uppercase'
            }}
          >
            {category}
          </Box>
        </Box>

        {/* Location and Date Section - 20% height */}
        <Box sx={{ height: '20%', p: 2, display: 'flex', alignItems: 'center', borderTop: '1px solid #f0f0f0' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666' }}>
            <Box
              component="span"
              sx={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                backgroundColor: '#2E7D32',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '0.7rem',
                fontWeight: 'bold'
              }}
            >
              S
            </Box>
            <Typography variant="body2" sx={{ color: '#666', fontWeight: 500 }}>
              Sports
            </Typography>
            <Box sx={{ mx: 1, color: '#ccc' }}>•</Box>
            <Typography variant="body2" sx={{ color: '#666' }}>
              {timestamp}
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  };
  
  // TrendingCard component
  const TrendingCard = ({ image, title, date, id }) => {
    const [imageError, setImageError] = useState(false);
    
    const handleClick = () => {
      navigate(`/sports/${id}`);
    };

    return (
      <Paper 
        elevation={0} 
          sx={{ 
          display: 'flex',
          alignItems: 'center',
          width: '369px',
          height: '88.96px',
          mb: 2,
          p: 1.5,
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          boxSizing: 'border-box',
          background: '#fff',
          gap: 2,
            cursor: 'pointer',
            '&:hover': {
            backgroundColor: 'rgba(46, 125, 50, 0.05)',
          }
        }}
        onClick={handleClick}
      >
        <Box sx={{ width: 60, height: 60, flexShrink: 0 }}>
          {!imageError ? (
            <Box
              component="img"
              src={image}
              alt="trending"
              onError={() => setImageError(true)}
              sx={{ width: '100%', height: '100%', borderRadius: 1, objectFit: 'cover' }}
            />
          ) : (
          <Box
            sx={{
                width: '100%',
                height: '100%',
                backgroundColor: '#f0f0f0',
                borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
                justifyContent: 'center',
                color: '#999',
                fontSize: '0.7rem'
              }}
            >
              SPT
            </Box>
          )}
          </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: 13, 
              fontWeight: 500, 
              color: '#222', 
              lineHeight: 1.2, 
              mb: 0.5, 
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}
          >
            {title}
          </Typography>
          <Typography sx={{ fontSize: 11, color: '#888' }}>{date}</Typography>
          </Box>
      </Paper>
    );
  };

  // AdCard component
  const AdCard = ({ image, height = 198.38 }) => {
    const handleAdClick = () => {
      if (sideAd && sideAd.redirectUrl) {
        window.open(sideAd.redirectUrl, '_blank', 'noopener,noreferrer');
      }
    };

    if (sideLoading) {
      return (
        <Box 
          sx={{ 
            width: '280px', 
            height: height, 
            bgcolor: '#f5f5f5', 
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 1,
          }}
        >
          <CircularProgress size={24} />
        </Box>
      );
    }

    if (sideError || !sideAd) {
      return (
        <Box 
          sx={{ 
          width: '280px', 
          height: height, 
            bgcolor: '#E0E0E0', 
          mb: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#999',
          borderRadius: 1,
            position: 'relative',
          }}
        >
        Ad
          <Typography 
            variant="caption" 
            sx={{ 
              position: 'absolute', 
              bottom: 5, 
            right: 5, 
              fontSize: '0.6rem',
              color: '#AAA' 
            }}
          >
          NewzTok
          </Typography>
        </Box>
      );
    }

    return (
      <Box 
        sx={{ 
          width: '280px', 
          height: height, 
          mb: 2,
          borderRadius: 1,
          overflow: 'hidden',
          cursor: 'pointer',
          position: 'relative',
        }}
        onClick={handleAdClick}
      >
          <Box 
            component="img"
          src={sideAd.imageUrl ? (sideAd.imageUrl.startsWith('http') ? sideAd.imageUrl : `${baseUrl}${sideAd.imageUrl}`) : image}
          alt="Advertisement"
            sx={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover',
            }}
            onError={(e) => {
            e.target.src = "https://via.placeholder.com/280x198?text=Advertisement";
          }}
        />
        <Typography 
          variant="caption" 
          sx={{ 
            position: 'absolute', 
            bottom: 5, 
            right: 5, 
            fontSize: '0.6rem',
            color: '#FFF',
            bgcolor: 'rgba(0,0,0,0.5)',
            px: 0.5,
            borderRadius: 0.5
          }}
        >
          Ad
        </Typography>
      </Box>
    );
  };

  // AutoScrollRow component
  const AutoScrollRow = ({ children }) => {
    const scrollRef = useRef(null);

    useEffect(() => {
      const scrollContainer = scrollRef.current;
      if (!scrollContainer) return;
      
      let frame;
      let speed = 1.2;
      
      function animate() {
        if (!scrollContainer) return;
        if (scrollContainer.scrollLeft + scrollContainer.offsetWidth >= scrollContainer.scrollWidth - 1) {
          scrollContainer.scrollLeft = 0;
          } else {
          scrollContainer.scrollLeft += speed;
        }
        frame = requestAnimationFrame(animate);
      }
      
      frame = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(frame);
    }, [children]);
    
      return (
        <Box 
        ref={scrollRef}
          sx={{ 
            display: 'flex',
          gap: 2,
          overflowX: 'hidden',
          width: '100%',
          scrollBehavior: 'smooth',
          '&::-webkit-scrollbar': { display: 'none' },
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
          pointerEvents: 'none',
        }}
      >
        {children}
        </Box>
      );
  };

  // MultiCardAutoSlider component
  const MultiCardAutoSlider = ({ cards, cardsPerSlide = 3, cardWidth = 370, gap = 32, height = 210 }) => {
    const [current, setCurrent] = useState(0);
    const totalCards = cards.length;
    const containerRef = useRef(null);

    useEffect(() => {
      const interval = setInterval(() => {
        setCurrent((prev) => (prev + 1) % (totalCards - cardsPerSlide + 1));
      }, 2500);
      return () => clearInterval(interval);
    }, [totalCards, cardsPerSlide]);

    useEffect(() => {
      const container = containerRef.current;
      if (container) {
        container.scrollTo({
          left: current * (cardWidth + gap),
          behavior: 'smooth',
        });
      }
    }, [current, cardWidth, gap]);

      return (
        <Box 
        ref={containerRef}
          sx={{ 
          width: `${cardWidth * cardsPerSlide + gap * (cardsPerSlide - 1)}px`,
          overflow: 'hidden',
            display: 'flex',
          scrollBehavior: 'smooth',
          '&::-webkit-scrollbar': { display: 'none' },
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
          pointerEvents: 'none',
        }}
      >
        <Box sx={{ display: 'flex', gap: `${gap}px` }}>
          {cards.map((card, idx) => (
            <Box 
              key={idx} 
        sx={{ 
                width: `${cardWidth}px`, 
                bgcolor: '#fff', 
                borderRadius: 2, 
                boxShadow: 1, 
                overflow: 'hidden', 
          display: 'flex',
                flexDirection: 'column', 
          alignItems: 'center',
                p: 0, 
                mb: 0,
                cursor: 'pointer' 
              }}
              onClick={() => navigate(`/sports/${card.id}`)}
            >
          <Box 
            component="img"
                src={card.image}
                alt={card.alt}
                sx={{ width: '100%', height: `${height}px`, objectFit: 'cover' }}
            onError={(e) => {
                  e.target.src = 'https://placehold.co/370x210/2E7D32/FFFFFF/png?text=Sports+News';
                }}
              />
              <Box sx={{ p: 2, pt: 2 }}>
                <Typography sx={{ fontSize: 15, color: '#222', fontWeight: 400, lineHeight: 1.4 }}>
                  {card.text}
                </Typography>
          </Box>
            </Box>
          ))}
        </Box>
      </Box>
    );
  };

  // Loading component
  const LoadingSpinner = () => (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
      <CircularProgress sx={{ color: '#2E7D32' }} />
    </Box>
  );

  // Error component
  const ErrorMessage = () => (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom color="error">
        {error}
      </Typography>
        <Typography 
        variant="body2" 
        component="button"
        onClick={fetchSportsNews}
          sx={{ 
          background: 'none', 
          border: 'none', 
          color: '#2E7D32', 
          cursor: 'pointer',
          textDecoration: 'underline',
          mt: 2
        }}
      >
        Try Again
        </Typography>
      </Box>
    );

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage />;
  }

  if (newsItems.length === 0) {
  return (
      <Box sx={{ 
        p: 3, 
        backgroundColor: '#F7FAFC', 
        borderRadius: 2, 
        textAlign: 'center',
        mb: 4
      }}>
        <Typography variant="h6">No sports news available at the moment.</Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Please check back later for updates.
        </Typography>
      </Box>
    );
  }

  // General sports news for top sections (filtered to avoid cricket-specific content)
  const generalSportsNews = sortNewsByDate(getGeneralSportsNews(newsItems));
  const videoNews = generalSportsNews.slice(0, 5).map(convertNewsToVideoFormat);
  const trendingNews = generalSportsNews.slice(5, 20).map(convertNewsToTrendingFormat);
  const bottomCards = generalSportsNews.slice(0, 18).map(convertNewsToVideoFormat);
  
  // Debug general sports news to ensure it doesn't contain cricket
  console.log('General sports news count:', generalSportsNews.length);
  if (generalSportsNews.length > 0) {
    console.log('First 3 general sports news items:');
    generalSportsNews.slice(0, 3).forEach((item, index) => {
      console.log(`${index + 1}. "${item.title?.substring(0, 60)}..."`);
    });
  }
  
  // Debug cricket news filtering and sorting
  console.log('=== CRICKET NEWS DEBUGGING ===');
  console.log('Total sports news items:', newsItems.length);
  
  // Check what cricket news is being filtered
  const rawCricketNews = filterNewsBySport(newsItems, 'cricket');
  console.log('Raw cricket news after filtering:', rawCricketNews.length);
  
  // Show dates of recent news items
  const today = new Date();
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  
  console.log('Today:', today.toDateString());
  console.log('Yesterday:', yesterday.toDateString());
  
  // Check all sports news for recent dates
  const recentSportsNews = newsItems.filter(item => {
    const possibleDateFields = [
      'created_at', 'createdAt', 'publishedAt', 'published_at', 
      'updatedAt', 'updated_at', 'date', 'timestamp', 'time'
    ];
    
    for (const field of possibleDateFields) {
      if (item[field]) {
        const date = new Date(item[field]);
        if (!isNaN(date.getTime())) {
          const isToday = date.toDateString() === today.toDateString();
          const isYesterday = date.toDateString() === yesterday.toDateString();
          return isToday || isYesterday;
        }
      }
    }
    return false;
  });
  
  console.log('Recent sports news (today/yesterday):', recentSportsNews.length);
  
  // Check if any recent news contains cricket keywords
  const recentCricketNews = recentSportsNews.filter(item => {
    const keywords = sportKeywords.cricket || [];
    const title = (item.title || '').toLowerCase();
    const content = (item.content || '').toLowerCase();
    const category = (item.category || '').toLowerCase();
    const subcategory = (item.subcategory || '').toLowerCase();
    
    return keywords.some(keyword => 
      title.includes(keyword.toLowerCase()) || 
      content.includes(keyword.toLowerCase()) ||
      category.includes(keyword.toLowerCase()) ||
      subcategory.includes(keyword.toLowerCase())
    );
  });
  
  console.log('Recent cricket news (today/yesterday):', recentCricketNews.length);
  
  if (recentCricketNews.length > 0) {
    console.log('Recent cricket news items:');
    recentCricketNews.forEach((item, index) => {
      console.log(`${index + 1}. "${item.title?.substring(0, 60)}..." - ${new Date(item.created_at || item.publishedAt || item.date).toLocaleString()}`);
    });
  }
  
  // Show a sample of all cricket news found
  if (rawCricketNews.length > 0) {
    console.log('All cricket news sample (first 5):');
    rawCricketNews.slice(0, 5).forEach((item, index) => {
      const dateField = item.created_at || item.publishedAt || item.date;
      const date = dateField ? new Date(dateField) : null;
      console.log(`${index + 1}. "${item.title?.substring(0, 60)}..." - ${date ? date.toLocaleString() : 'No date'}`);
    });
  }
  
  // Sport-specific news data (sorted by date)
  const cricketNews = sortNewsByDate(rawCricketNews);
  
  // Additional safety check - if no cricket news found, don't show any fallback
  if (cricketNews.length === 0) {
    console.log('⚠️  No cricket news found after strict filtering - showing empty section');
  }
  const footballNews = sortNewsByDate(filterNewsBySport(newsItems, 'football'));
  const volleyballNews = sortNewsByDate(filterNewsBySport(newsItems, 'volleyball'));
  const chessNews = sortNewsByDate(filterNewsBySport(newsItems, 'chess'));
  const tennisNews = sortNewsByDate(filterNewsBySport(newsItems, 'tennis'));
  const boxingNews = sortNewsByDate(filterNewsBySport(newsItems, 'boxing'));
  const tableTennisNews = sortNewsByDate(filterNewsBySport(newsItems, 'table tennis'));
  
  console.log('Cricket news after sorting:', cricketNews.length);
  if (cricketNews.length > 0) {
    console.log('First 3 cricket news items after sorting:');
    cricketNews.slice(0, 3).forEach((item, index) => {
      const dateField = item.created_at || item.publishedAt || item.date;
      const date = dateField ? new Date(dateField) : null;
      console.log(`${index + 1}. "${item.title?.substring(0, 60)}..." - ${date ? date.toLocaleString() : 'No date'}`);
    });
  }
  
  console.log('=== END CRICKET NEWS DEBUGGING ===');
  
  // Cricket section data (with additional date verification)
  const cricketVideoNews = cricketNews.slice(0, 5).map(convertNewsToVideoFormat);
  
  // Additional safety check: Ensure cricket videos are sorted by date (most recent first)
  const sortedCricketVideoNews = [...cricketVideoNews].sort((a, b) => {
    const dateA = new Date(a.timestamp || a.date || 0);
    const dateB = new Date(b.timestamp || b.date || 0);
    return dateB.getTime() - dateA.getTime();
  });
  
  const cricketTrendingNews = cricketNews.slice(5, 20).map(convertNewsToTrendingFormat);
  const cricketBottomCards = cricketNews.slice(0, 18).map(convertNewsToVideoFormat);
  
  // Football section data
  const footballVideoNews = footballNews.slice(0, 5).map(convertNewsToVideoFormat);
  const footballTrendingNews = footballNews.slice(5, 20).map(convertNewsToTrendingFormat);
  const footballBottomCards = footballNews.slice(0, 18).map(convertNewsToVideoFormat);
  
  // Volleyball section data
  const volleyballVideoNews = volleyballNews.slice(0, 5).map(convertNewsToVideoFormat);
  const volleyballTrendingNews = volleyballNews.slice(5, 20).map(convertNewsToTrendingFormat);
  const volleyballBottomCards = volleyballNews.slice(0, 18).map(convertNewsToVideoFormat);
  
  // Chess section data
  const chessVideoNews = chessNews.slice(0, 5).map(convertNewsToVideoFormat);
  const chessTrendingNews = chessNews.slice(5, 20).map(convertNewsToTrendingFormat);
  const chessBottomCards = chessNews.slice(0, 18).map(convertNewsToVideoFormat);
  
  // Tennis section data
  const tennisVideoNews = tennisNews.slice(0, 5).map(convertNewsToVideoFormat);
  const tennisTrendingNews = tennisNews.slice(5, 20).map(convertNewsToTrendingFormat);
  const tennisBottomCards = tennisNews.slice(0, 18).map(convertNewsToVideoFormat);
  
  // Boxing section data
  const boxingVideoNews = boxingNews.slice(0, 5).map(convertNewsToVideoFormat);
  const boxingTrendingNews = boxingNews.slice(5, 20).map(convertNewsToTrendingFormat);
  const boxingBottomCards = boxingNews.slice(0, 18).map(convertNewsToVideoFormat);
  
  // Table Tennis section data
  const tableTennisVideoNews = tableTennisNews.slice(0, 5).map(convertNewsToVideoFormat);
  const tableTennisTrendingNews = tableTennisNews.slice(5, 20).map(convertNewsToTrendingFormat);
  const tableTennisBottomCards = tableTennisNews.slice(0, 18).map(convertNewsToVideoFormat);
  
  // Most shared cards (mix of all sports - sorted by date)
  const mostSharedCards = sortNewsByDate(newsItems).slice(0, 10).map(news => ({
    image: getImageUrl(news),
    alt: news.title,
    text: news.title,
    id: news.id
  }));

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fafafa', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flex: 1, px: 4, pt: 3, pb: 0 }}>
        {/* Top Sports News Section */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={7} lg={7}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5 }}>Top Sports News</Typography>
            <Box sx={{ display: 'flex', gap: 10, justifyContent: 'space-between' }}>
              <Box sx={{ flex: 1, maxWidth: '520px' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: '#222' }}>VIDEOS</Typography>
                {videoNews.map((news, idx) => (
                  <Box key={idx} sx={{ mb: 3 }}>
                    <NewsCard {...news} />
                  </Box>
                ))}
              </Box>
              
              {/* Trending Section */}
              <Box sx={{ minWidth: '369px', maxWidth: '369px', flexShrink: 0, mx: 5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: '#222' }}>TRENDING</Typography>
                {trendingNews.map((item, idx) => (
                  <TrendingCard key={idx} {...item} />
                ))}
              </Box>
              
              {/* Ad Section */}
              <Box sx={{ minWidth: '280px', maxWidth: '280px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <AdCard image="https://dummyimage.com/280x198/eeeeee/aaa.png&text=Ads" />
                <AdCard image="https://dummyimage.com/280x198/eeeeee/aaa.png&text=Ads" />
                <AdCard image="https://dummyimage.com/280x198/eeeeee/aaa.png&text=Ads" />
                <AdCard image="https://dummyimage.com/280x198/eeeeee/aaa.png&text=Ads" />
              </Box>
            </Box>
          </Grid>
        </Grid>
        
        {/* Bottom Cards Row (Top News) */}
        <Box sx={{ mt: 6, display: 'flex', alignItems: 'center', gap: 2 }}>
          <AutoScrollRow>
            {bottomCards.map((card, idx) => (
              <Box 
                key={idx} 
        sx={{ 
                  minWidth: '230.22px', 
                  maxWidth: '230.22px', 
                  height: '129.5px', 
                  bgcolor: '#fff', 
                  borderRadius: 2, 
                  boxShadow: 1, 
          overflow: 'hidden',
                  display: 'flex', 
                  flexDirection: 'column',
                  cursor: 'pointer'
                }}
                onClick={() => navigate(`/sports/${card.id}`)}
              >
                <Box
                  component="img"
                  src={card.image}
                  alt={card.title}
                  sx={{ width: '100%', height: '60%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.src = 'https://placehold.co/230x78/2E7D32/FFFFFF/png?text=Sports';
                  }}
                />
                <Box sx={{ p: 1 }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#222', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {card.title}
                  </Typography>
                </Box>
              </Box>
            ))}
          </AutoScrollRow>
        </Box>
        
        {/* Other Sports News Section */}
        <Grid container spacing={3} sx={{ mt: 8 }}>
          <Grid item xs={12} md={7} lg={7}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5 }}>Other Sports News</Typography>
            <Box sx={{ display: 'flex', gap: 10, justifyContent: 'space-between' }}>
              <Box sx={{ flex: 1, maxWidth: '520px' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: '#222' }}>VIDEOS</Typography>
                {videoNews.map((news, idx) => (
                  <Box key={idx} sx={{ mb: 3 }}>
                    <NewsCard {...news} />
                  </Box>
                ))}
              </Box>
              
              {/* Latest News Section */}
              <Box sx={{ minWidth: '369px', maxWidth: '369px', flexShrink: 0, mx: 5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: '#222' }}>LATEST NEWS</Typography>
                {trendingNews.map((item, idx) => (
                  <TrendingCard key={idx} {...item} />
                ))}
              </Box>
              
              {/* Ad Section */}
              <Box sx={{ minWidth: '280px', maxWidth: '280px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <AdCard image="https://dummyimage.com/280x198/eeeeee/aaa.png&text=Ads" />
                <AdCard image="https://dummyimage.com/280x198/eeeeee/aaa.png&text=Ads" />
                <AdCard image="https://dummyimage.com/280x198/eeeeee/aaa.png&text=Ads" />
                <AdCard image="https://dummyimage.com/280x198/eeeeee/aaa.png&text=Ads" />
              </Box>
            </Box>
          </Grid>
        </Grid>
        
        {/* Bottom Cards Row (Other News) */}
        <Box sx={{ mt: 6, display: 'flex', alignItems: 'center', gap: 2 }}>
          <AutoScrollRow>
            {bottomCards.map((card, idx) => (
              <Box 
                key={idx} 
          sx={{
                  minWidth: '230.22px', 
                  maxWidth: '230.22px', 
                  height: '129.5px', 
                  bgcolor: '#fff', 
                  borderRadius: 2, 
                  boxShadow: 1, 
                  overflow: 'hidden', 
                  display: 'flex', 
                  flexDirection: 'column',
                  cursor: 'pointer'
                }}
                onClick={() => navigate(`/sports/${card.id}`)}
              >
                <Box
                  component="img"
                  src={card.image}
                  alt={card.title}
                  sx={{ width: '100%', height: '60%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.src = 'https://placehold.co/230x78/2E7D32/FFFFFF/png?text=Sports';
                  }}
                />
                <Box sx={{ p: 1 }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#222', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {card.title}
                  </Typography>
                </Box>
              </Box>
            ))}
          </AutoScrollRow>
        </Box>

        {/* Cricket Section */}
        <Grid container spacing={3} sx={{ mt: 8 }}>
          <Grid item xs={12} md={7} lg={7}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5 }}>Cricket Section</Typography>
            <Box sx={{ display: 'flex', gap: 10, justifyContent: 'space-between' }}>
              <Box sx={{ flex: 1, maxWidth: '520px' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: '#222' }}>VIDEOS</Typography>
                {sortedCricketVideoNews.length > 0 ? (
                  sortedCricketVideoNews.map((news, idx) => (
                    <Box key={idx} sx={{ mb: 3 }}>
                      <NewsCard {...news} />
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" sx={{ color: '#666', fontStyle: 'italic' }}>
                    No cricket videos available at the moment.
                  </Typography>
                )}
              </Box>
              
              {/* Latest News Section */}
              <Box sx={{ minWidth: '369px', maxWidth: '369px', flexShrink: 0, mx: 5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: '#222' }}>LATEST NEWS</Typography>
                {cricketTrendingNews.length > 0 ? (
                  cricketTrendingNews.map((item, idx) => (
                    <TrendingCard key={idx} {...item} />
                  ))
                ) : (
                  <Typography variant="body2" sx={{ color: '#666', fontStyle: 'italic' }}>
                    No cricket news available at the moment.
                  </Typography>
                )}
              </Box>
              
              {/* Ad Section */}
              <Box sx={{ minWidth: '280px', maxWidth: '280px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <AdCard image="https://dummyimage.com/280x198/eeeeee/aaa.png&text=Ads" />
                <AdCard image="https://dummyimage.com/280x198/eeeeee/aaa.png&text=Ads" />
                <AdCard image="https://dummyimage.com/280x198/eeeeee/aaa.png&text=Ads" />
                <AdCard image="https://dummyimage.com/280x198/eeeeee/aaa.png&text=Ads" />
              </Box>
            </Box>
          </Grid>
        </Grid>
        
        {/* Bottom Cards Row (Cricket News) */}
        <Box sx={{ mt: 6, display: 'flex', alignItems: 'center', gap: 2 }}>
          <AutoScrollRow>
            {cricketBottomCards.length > 0 ? (
              cricketBottomCards.map((card, idx) => (
                <Box 
                  key={idx} 
          sx={{
                    minWidth: '230.22px', 
                    maxWidth: '230.22px', 
                    height: '129.5px', 
                    bgcolor: '#fff', 
                    borderRadius: 2, 
                    boxShadow: 1, 
                    overflow: 'hidden', 
                    display: 'flex', 
                    flexDirection: 'column',
                    cursor: 'pointer'
                  }}
                  onClick={() => navigate(`/sports/${card.id}`)}
                >
                  <Box
                    component="img"
                    src={card.image}
                    alt={card.title}
                    sx={{ width: '100%', height: '60%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/230x78/2E7D32/FFFFFF/png?text=Cricket';
                    }}
                  />
                  <Box sx={{ p: 1 }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#222', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {card.title}
                    </Typography>
                  </Box>
                </Box>
              ))
            ) : (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="body2" sx={{ color: '#666', fontStyle: 'italic' }}>
                  No cricket news available for bottom cards.
                </Typography>
              </Box>
            )}
          </AutoScrollRow>
        </Box>

        {/* Football Section */}
        <Grid container spacing={3} sx={{ mt: 8 }}>
          <Grid item xs={12} md={7} lg={7}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5 }}>Football Section</Typography>
            <Box sx={{ display: 'flex', gap: 10, justifyContent: 'space-between' }}>
              <Box sx={{ flex: 1, maxWidth: '520px' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: '#222' }}>VIDEOS</Typography>
                {footballVideoNews.length > 0 ? (
                  footballVideoNews.map((news, idx) => (
                    <Box key={idx} sx={{ mb: 3 }}>
                      <NewsCard {...news} />
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" sx={{ color: '#666', fontStyle: 'italic' }}>
                    No football videos available at the moment.
                  </Typography>
                )}
              </Box>
              
              {/* Latest News Section */}
              <Box sx={{ minWidth: '369px', maxWidth: '369px', flexShrink: 0, mx: 5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: '#222' }}>LATEST NEWS</Typography>
                {footballTrendingNews.length > 0 ? (
                  footballTrendingNews.map((item, idx) => (
                    <TrendingCard key={idx} {...item} />
                  ))
                ) : (
                  <Typography variant="body2" sx={{ color: '#666', fontStyle: 'italic' }}>
                    No football news available at the moment.
                  </Typography>
                )}
              </Box>
              
              {/* Ad Section */}
              <Box sx={{ minWidth: '280px', maxWidth: '280px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <AdCard image="https://dummyimage.com/280x198/eeeeee/aaa.png&text=Ads" />
                <AdCard image="https://dummyimage.com/280x198/eeeeee/aaa.png&text=Ads" />
                <AdCard image="https://dummyimage.com/280x198/eeeeee/aaa.png&text=Ads" />
                <AdCard image="https://dummyimage.com/280x198/eeeeee/aaa.png&text=Ads" />
              </Box>
            </Box>
          </Grid>
        </Grid>
        
        {/* Bottom Cards Row (Football News) */}
        <Box sx={{ mt: 6, display: 'flex', alignItems: 'center', gap: 2 }}>
          <AutoScrollRow>
            {footballBottomCards.length > 0 ? (
              footballBottomCards.map((card, idx) => (
                <Box 
                  key={idx} 
          sx={{
                    minWidth: '230.22px', 
                    maxWidth: '230.22px', 
                    height: '129.5px', 
                    bgcolor: '#fff', 
                    borderRadius: 2, 
                    boxShadow: 1, 
                    overflow: 'hidden', 
                    display: 'flex', 
                    flexDirection: 'column',
                    cursor: 'pointer'
                  }}
                  onClick={() => navigate(`/sports/${card.id}`)}
                >
                  <Box
                    component="img"
                    src={card.image}
                    alt={card.title}
                    sx={{ width: '100%', height: '60%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/230x78/2E7D32/FFFFFF/png?text=Football';
                    }}
                  />
                  <Box sx={{ p: 1 }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#222', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {card.title}
                    </Typography>
                  </Box>
                </Box>
              ))
            ) : (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="body2" sx={{ color: '#666', fontStyle: 'italic' }}>
                  No football news available for bottom cards.
                </Typography>
              </Box>
            )}
          </AutoScrollRow>
        </Box>

        {/* Volleyball Section */}
        <Grid container spacing={3} sx={{ mt: 8 }}>
          <Grid item xs={12} md={7} lg={7}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5 }}>Volleyball Section</Typography>
            <Box sx={{ display: 'flex', gap: 10, justifyContent: 'space-between' }}>
              <Box sx={{ flex: 1, maxWidth: '520px' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: '#222' }}>VIDEOS</Typography>
                {volleyballVideoNews.length > 0 ? (
                  volleyballVideoNews.map((news, idx) => (
                    <Box key={idx} sx={{ mb: 3 }}>
                      <NewsCard {...news} />
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" sx={{ color: '#666', fontStyle: 'italic' }}>
                    No volleyball videos available at the moment.
                  </Typography>
                )}
              </Box>
              
              {/* Latest News Section */}
              <Box sx={{ minWidth: '369px', maxWidth: '369px', flexShrink: 0, mx: 5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: '#222' }}>LATEST NEWS</Typography>
                {volleyballTrendingNews.length > 0 ? (
                  volleyballTrendingNews.map((item, idx) => (
                    <TrendingCard key={idx} {...item} />
                  ))
                ) : (
                  <Typography variant="body2" sx={{ color: '#666', fontStyle: 'italic' }}>
                    No volleyball news available at the moment.
                  </Typography>
                )}
              </Box>
              
              {/* Ad Section */}
              <Box sx={{ minWidth: '280px', maxWidth: '280px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <AdCard image="https://dummyimage.com/280x198/eeeeee/aaa.png&text=Ads" />
                <AdCard image="https://dummyimage.com/280x198/eeeeee/aaa.png&text=Ads" />
                <AdCard image="https://dummyimage.com/280x198/eeeeee/aaa.png&text=Ads" />
                <AdCard image="https://dummyimage.com/280x198/eeeeee/aaa.png&text=Ads" />
              </Box>
            </Box>
          </Grid>
        </Grid>
        
        {/* Bottom Cards Row (Volleyball News) */}
        <Box sx={{ mt: 6, display: 'flex', alignItems: 'center', gap: 2 }}>
          <AutoScrollRow>
            {volleyballBottomCards.length > 0 ? (
              volleyballBottomCards.map((card, idx) => (
                <Box 
                  key={idx} 
          sx={{
                    minWidth: '230.22px', 
                    maxWidth: '230.22px', 
                    height: '129.5px', 
                    bgcolor: '#fff', 
                    borderRadius: 2, 
                    boxShadow: 1, 
                    overflow: 'hidden', 
                    display: 'flex', 
                    flexDirection: 'column',
                    cursor: 'pointer'
                  }}
                  onClick={() => navigate(`/sports/${card.id}`)}
                >
                  <Box
                    component="img"
                    src={card.image}
                    alt={card.title}
                    sx={{ width: '100%', height: '60%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/230x78/2E7D32/FFFFFF/png?text=Volleyball';
                    }}
                  />
                  <Box sx={{ p: 1 }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#222', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {card.title}
                    </Typography>
              </Box>
                </Box>
              ))
            ) : (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="body2" sx={{ color: '#666', fontStyle: 'italic' }}>
                  No volleyball news available for bottom cards.
            </Typography>
              </Box>
            )}
          </AutoScrollRow>
        </Box>

        {/* Chess Section - Only show if chess content exists */}
        {chessVideoNews.length > 0 || chessTrendingNews.length > 0 ? (
                    <Grid container spacing={3} sx={{ mt: 8 }}>
            <Grid item xs={12} md={7} lg={7}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5 }}>Chess Section</Typography>
              <Box sx={{ display: 'flex', gap: 10, justifyContent: 'space-between' }}>
                <Box sx={{ flex: 1, maxWidth: '520px' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: '#222' }}>VIDEOS</Typography>
                  {chessVideoNews.length > 0 ? (
                    chessVideoNews.map((news, idx) => (
                      <Box key={idx} sx={{ mb: 3 }}>
                        <NewsCard {...news} />
                      </Box>
                    ))
                  ) : (
                    <Typography variant="body2" sx={{ color: '#666', fontStyle: 'italic' }}>
                      No chess videos available at the moment.
            </Typography>
                  )}
          </Box>
                
                {/* Latest News Section */}
                <Box sx={{ minWidth: '369px', maxWidth: '369px', flexShrink: 0, mx: 5 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: '#222' }}>LATEST NEWS</Typography>
                  {chessTrendingNews.length > 0 ? (
                    chessTrendingNews.map((item, idx) => (
                      <TrendingCard key={idx} {...item} />
                    ))
                  ) : (
                    <Typography variant="body2" sx={{ color: '#666', fontStyle: 'italic' }}>
                      No chess news available at the moment.
                    </Typography>
                  )}
      </Box>

                {/* Ad Section */}
                <Box sx={{ minWidth: '280px', maxWidth: '280px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <AdCard image="https://dummyimage.com/280x198/eeeeee/aaa.png&text=Ads" />
                  <AdCard image="https://dummyimage.com/280x198/eeeeee/aaa.png&text=Ads" />
                  <AdCard image="https://dummyimage.com/280x198/eeeeee/aaa.png&text=Ads" />
                  <AdCard image="https://dummyimage.com/280x198/eeeeee/aaa.png&text=Ads" />
                </Box>
              </Box>
            </Grid>
          </Grid>
        ) : null}
        
        {/* Bottom Cards Row (Chess News) */}
        <Box sx={{ mt: 6, display: 'flex', alignItems: 'center', gap: 2 }}>
          <AutoScrollRow>
            {chessBottomCards.length > 0 ? (
              chessBottomCards.map((card, idx) => (
                <Box 
                  key={idx} 
        sx={{ 
                    minWidth: '230.22px', 
                    maxWidth: '230.22px', 
                    height: '129.5px', 
                    bgcolor: '#fff', 
                    borderRadius: 2, 
                    boxShadow: 1, 
                    overflow: 'hidden', 
                    display: 'flex', 
                    flexDirection: 'column',
                    cursor: 'pointer'
                  }}
                  onClick={() => navigate(`/sports/${card.id}`)}
                >
                  <Box
                    component="img"
                    src={card.image}
                    alt={card.title}
                    sx={{ width: '100%', height: '60%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/230x78/2E7D32/FFFFFF/png?text=Chess';
                    }}
                  />
                  <Box sx={{ p: 1 }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#222', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {card.title}
            </Typography>
          </Box>
          </Box>
              ))
            ) : (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="body2" sx={{ color: '#666', fontStyle: 'italic' }}>
                  No chess news available for bottom cards.
            </Typography>
          </Box>
            )}
          </AutoScrollRow>
              </Box>
              
                {/* Tennis Section */}
        <Grid container spacing={3} sx={{ mt: 8 }}>
          <Grid item xs={12} md={7} lg={7}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5 }}>Tennis Section</Typography>
            <Box sx={{ display: 'flex', gap: 10, justifyContent: 'space-between' }}>
              <Box sx={{ flex: 1, maxWidth: '520px' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: '#222' }}>VIDEOS</Typography>
                {tennisVideoNews.length > 0 ? (
                  tennisVideoNews.map((news, idx) => (
                    <Box key={idx} sx={{ mb: 3 }}>
                      <NewsCard {...news} />
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" sx={{ color: '#666', fontStyle: 'italic' }}>
                    No tennis videos available at the moment.
            </Typography>
                )}
          </Box>
              
              {/* Latest News Section */}
              <Box sx={{ minWidth: '369px', maxWidth: '369px', flexShrink: 0, mx: 5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: '#222' }}>LATEST NEWS</Typography>
                {tennisTrendingNews.length > 0 ? (
                  tennisTrendingNews.map((item, idx) => (
                    <TrendingCard key={idx} {...item} />
                  ))
                ) : (
                  <Typography variant="body2" sx={{ color: '#666', fontStyle: 'italic' }}>
                    No tennis news available at the moment.
                  </Typography>
                )}
              </Box>
              
              {/* Ad Section */}
              <Box sx={{ minWidth: '280px', maxWidth: '280px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <AdCard image="https://dummyimage.com/280x198/eeeeee/aaa.png&text=Ads" />
                <AdCard image="https://dummyimage.com/280x198/eeeeee/aaa.png&text=Ads" />
                <AdCard image="https://dummyimage.com/280x198/eeeeee/aaa.png&text=Ads" />
                <AdCard image="https://dummyimage.com/280x198/eeeeee/aaa.png&text=Ads" />
              </Box>
            </Box>
          </Grid>
        </Grid>
        
        {/* Bottom Cards Row (Tennis News) */}
        <Box sx={{ mt: 6, display: 'flex', alignItems: 'center', gap: 2 }}>
          <AutoScrollRow>
            {tennisBottomCards.length > 0 ? (
              tennisBottomCards.map((card, idx) => (
                <Box 
                  key={idx} 
                sx={{ 
                    minWidth: '230.22px', 
                    maxWidth: '230.22px', 
                    height: '129.5px', 
                    bgcolor: '#fff', 
                    borderRadius: 2, 
                    boxShadow: 1, 
                    overflow: 'hidden', 
                    display: 'flex', 
                    flexDirection: 'column',
                    cursor: 'pointer'
                  }}
                  onClick={() => navigate(`/sports/${card.id}`)}
                >
                      <Box 
                        component="img" 
                    src={card.image}
                    alt={card.title}
                    sx={{ width: '100%', height: '60%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/230x78/2E7D32/FFFFFF/png?text=Tennis';
                    }}
                  />
                  <Box sx={{ p: 1 }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#222', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {card.title}
                      </Typography>
                  </Box>
                </Box>
              ))
            ) : (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="body2" sx={{ color: '#666', fontStyle: 'italic' }}>
                  No tennis news available for bottom cards.
                      </Typography>
              </Box>
            )}
          </AutoScrollRow>
            </Box>

                {/* Boxing Section */}
        <Grid container spacing={3} sx={{ mt: 8 }}>
          <Grid item xs={12} md={7} lg={7}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5 }}>Boxing Section</Typography>
            <Box sx={{ display: 'flex', gap: 10, justifyContent: 'space-between' }}>
              <Box sx={{ flex: 1, maxWidth: '520px' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: '#222' }}>VIDEOS</Typography>
                {boxingVideoNews.length > 0 ? (
                  boxingVideoNews.map((news, idx) => (
                    <Box key={idx} sx={{ mb: 3 }}>
                      <NewsCard {...news} />
          </Box>
                  ))
                ) : (
                  <Typography variant="body2" sx={{ color: '#666', fontStyle: 'italic' }}>
                    No boxing videos available at the moment.
                  </Typography>
                )}
              </Box>
              
              {/* Latest News Section */}
              <Box sx={{ minWidth: '369px', maxWidth: '369px', flexShrink: 0, mx: 5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: '#222' }}>LATEST NEWS</Typography>
                {boxingTrendingNews.length > 0 ? (
                  boxingTrendingNews.map((item, idx) => (
                    <TrendingCard key={idx} {...item} />
                  ))
                ) : (
                  <Typography variant="body2" sx={{ color: '#666', fontStyle: 'italic' }}>
                    No boxing news available at the moment.
                  </Typography>
                )}
              </Box>
              
              {/* Ad Section */}
              <Box sx={{ minWidth: '280px', maxWidth: '280px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <AdCard image="https://dummyimage.com/280x198/eeeeee/aaa.png&text=Ads" />
                <AdCard image="https://dummyimage.com/280x198/eeeeee/aaa.png&text=Ads" />
                <AdCard image="https://dummyimage.com/280x198/eeeeee/aaa.png&text=Ads" />
                <AdCard image="https://dummyimage.com/280x198/eeeeee/aaa.png&text=Ads" />
              </Box>
            </Box>
          </Grid>
        </Grid>
        
        {/* Bottom Cards Row (Boxing News) */}
        <Box sx={{ mt: 6, display: 'flex', alignItems: 'center', gap: 2 }}>
          <AutoScrollRow>
            {boxingBottomCards.length > 0 ? (
              boxingBottomCards.map((card, idx) => (
                <Box 
                  key={idx} 
        sx={{ 
                    minWidth: '230.22px', 
                    maxWidth: '230.22px', 
                    height: '129.5px', 
                    bgcolor: '#fff', 
                    borderRadius: 2, 
                    boxShadow: 1, 
                    overflow: 'hidden', 
                    display: 'flex', 
                    flexDirection: 'column',
                    cursor: 'pointer'
                  }}
                  onClick={() => navigate(`/sports/${card.id}`)}
                >
                  <Box
                    component="img"
                    src={card.image}
                    alt={card.title}
                    sx={{ width: '100%', height: '60%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/230x78/2E7D32/FFFFFF/png?text=Boxing';
                    }}
                  />
                  <Box sx={{ p: 1 }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#222', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {card.title}
                    </Typography>
                  </Box>
                </Box>
              ))
            ) : (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="body2" sx={{ color: '#666', fontStyle: 'italic' }}>
                  No boxing news available for bottom cards.
                </Typography>
              </Box>
            )}
          </AutoScrollRow>
        </Box>

                {/* Table Tennis Section */}
        <Grid container spacing={3} sx={{ mt: 8 }}>
          <Grid item xs={12} md={7} lg={7}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5 }}>Table Tennis Section</Typography>
            <Box sx={{ display: 'flex', gap: 10, justifyContent: 'space-between' }}>
              <Box sx={{ flex: 1, maxWidth: '520px' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: '#222' }}>VIDEOS</Typography>
                {tableTennisVideoNews.length > 0 ? (
                  tableTennisVideoNews.map((news, idx) => (
                    <Box key={idx} sx={{ mb: 3 }}>
                      <NewsCard {...news} />
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" sx={{ color: '#666', fontStyle: 'italic' }}>
                    No table tennis videos available at the moment.
                  </Typography>
                )}
                    </Box>
              
              {/* Latest News Section */}
              <Box sx={{ minWidth: '369px', maxWidth: '369px', flexShrink: 0, mx: 5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: '#222' }}>LATEST NEWS</Typography>
                {tableTennisTrendingNews.length > 0 ? (
                  tableTennisTrendingNews.map((item, idx) => (
                    <TrendingCard key={idx} {...item} />
                  ))
                ) : (
                  <Typography variant="body2" sx={{ color: '#666', fontStyle: 'italic' }}>
                    No table tennis news available at the moment.
                  </Typography>
                )}
                  </Box>
              
              {/* Ad Section */}
              <Box sx={{ minWidth: '280px', maxWidth: '280px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <AdCard image="https://dummyimage.com/280x198/eeeeee/aaa.png&text=Ads" />
                <AdCard image="https://dummyimage.com/280x198/eeeeee/aaa.png&text=Ads" />
                <AdCard image="https://dummyimage.com/280x198/eeeeee/aaa.png&text=Ads" />
                <AdCard image="https://dummyimage.com/280x198/eeeeee/aaa.png&text=Ads" />
            </Box>
            </Box>
          </Grid>
        </Grid>
        
        {/* Bottom Cards Row (Table Tennis News) */}
        <Box sx={{ mt: 6, display: 'flex', alignItems: 'center', gap: 2 }}>
          <AutoScrollRow>
            {tableTennisBottomCards.length > 0 ? (
              tableTennisBottomCards.map((card, idx) => (
                <Box 
                  key={idx} 
              sx={{ 
                    minWidth: '230.22px', 
                    maxWidth: '230.22px', 
                    height: '129.5px', 
                    bgcolor: '#fff', 
                    borderRadius: 2, 
                    boxShadow: 1, 
                    overflow: 'hidden', 
                display: 'flex', 
                flexDirection: 'column', 
                    cursor: 'pointer'
                  }}
                  onClick={() => navigate(`/sports/${card.id}`)}
                >
                  <Box
                    component="img"
                    src={card.image}
                    alt={card.title}
                    sx={{ width: '100%', height: '60%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/230x78/2E7D32/FFFFFF/png?text=Table+Tennis';
                    }}
                  />
                  <Box sx={{ p: 1 }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#222', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {card.title}
                </Typography>
              </Box>
            </Box>
              ))
            ) : (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="body2" sx={{ color: '#666', fontStyle: 'italic' }}>
                  No table tennis news available for bottom cards.
                </Typography>
          </Box>
        )}
          </AutoScrollRow>
        </Box>

        {/* MOST SHARED Section */}
        <Box sx={{ mt: 8, bgcolor: '#f5f5f5', py: 4, px: 0, position: 'relative' }}>
          <Box sx={{ maxWidth: '1200px', mx: 'auto', px: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, letterSpacing: 1, color: '#111', mr: 2 }}>
                MOST SHARED SPORTS NEWS
              </Typography>
            </Box>
            <Box sx={{ height: '2px', width: '100%', bgcolor: 'transparent', mb: 3, position: 'relative' }}>
              <Box sx={{ position: 'absolute', left: 0, top: 0, width: '250px', height: '2px', bgcolor: '#2E7D32' }} />
            </Box>
            <MultiCardAutoSlider
              cards={mostSharedCards}
              cardsPerSlide={3}
              cardWidth={370}
              gap={32}
              height={210}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Sports; 