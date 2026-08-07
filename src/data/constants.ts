export const TN_DISTRICTS = [
  "Ariyalur",
  "Chengalpattu",
  "Chennai",
  "Coimbatore",
  "Cuddalore",
  "Dharmapuri",
  "Dindigul",
  "Erode",
  "Kallakurichi",
  "Kancheepuram",
  "Karur",
  "Krishnagiri",
  "Madurai",
  "Mayiladuthurai",
  "Nagapattinam",
  "Namakkal",
  "Nilgiris",
  "Perambalur",
  "Pudukkottai",
  "Ramanathapuram",
  "Ranipet",
  "Salem",
  "Sivaganga",
  "Tenkasi",
  "Thanjavur",
  "Theni",
  "Thoothukudi",
  "Tiruchirappalli",
  "Tirunelveli",
  "Tirupathur",
  "Tiruppur",
  "Tiruvallur",
  "Tiruvannamalai",
  "Tiruvarur",
  "Vellore",
  "Viluppuram",
  "Virudhunagar"
];

export interface SampleCase {
  title: string;
  description: string;
  rawDescription: string;
  intake: {
    workspace?: string;
    subWorkspace?: string;
    module?: string;
    engine?: string;
    clientName: string;
    mobile: string;
    surveyNumber?: string;
    village?: string;
    taluk?: string;
    district: string;
    oppositeParty: string;
    partyRelationship?: string;
    courtOrForum?: string;
    existingAdvocate: string;
    existingCaseNumber: string;
    limitationRisk: string;
  };
}

export const SAMPLE_CASES: SampleCase[] = [
  {
    title: "மதுரை பூர்வீக சொத்து பத்திரம் போலிப்பதிவு (Property360)",
    description: "சகோதரியின் அனுமதியின்றி பூர்வீக விவசாய நிலத்தை சகோதரர் போலி செட்டில்மென்ட் பத்திரம் மூலம் மாற்றியுள்ளார்.",
    rawDescription: "எனது தந்தை 5 வருடங்களுக்கு முன்பு உயில் எழுதாமல் இறந்துவிட்டார். நாங்கள் 3 உடன்பிறப்புகள். நேற்று எனது மூத்த சகோதரர் மதுரையில் உள்ள எங்கள் பூர்வீக விவசாய நிலம் முழுவதையும் அவரது மனைவிக்கு செட்டில்மென்ட் பத்திரம் மூலம் ரகசியமாக பதிவு செய்ததை அறிந்தேன். இப்போது அவர்கள் பட்டா உட்பிரிவு செய்ய வட்டாட்சியரிடம் விண்ணப்பித்துள்ளனர். என்னிடம் அசல் தாய் பத்திரம் இல்லை, இசி (விற்பனை வழிகாட்டி/வில்லங்க சான்றிதழ்) மட்டுமே உள்ளது.",
    intake: {
      workspace: "Citizen360",
      subWorkspace: "Property360",
      module: "Registration",
      engine: "CaseClassificationAI",
      clientName: "ரமேஷ் குமார்",
      mobile: "9845012345",
      surveyNumber: "142/3B",
      village: "மேலூர்",
      taluk: "மேலூர்",
      district: "Madurai",
      oppositeParty: "சுரேஷ் குமார் & மனைவி",
      partyRelationship: "சகோதரர் & சகோதரி (உடன்பிறந்தவர்கள்)",
      courtOrForum: "சார்பதிவாளர் அலுவலகம் & வட்டாட்சியர்",
      existingAdvocate: "No",
      existingCaseNumber: "",
      limitationRisk: "No"
    }
  },
  {
    title: "சென்னை காசோலைத் திரும்புதல் வழக்கு (Criminal360 - Sec 138 NI Act)",
    description: "ரூ. 15 லட்சம் கடன் தொகைகாக வழங்கப்பட்ட காசோலை வங்கியில் போதிய பணமின்மையால் திரும்பியது.",
    rawDescription: "எனது வணிக கூட்டாளி எனது கடன் தொகையான ரூ. 15,00,000-க்கு வழங்கிய காசோலை வங்கியில் கணக்கில் போதிய பணமில்லை (Insufficient Funds) எனக் கூறி திரும்பப் பெறப்பட்டது. வங்கி திரும்புதல் குறிப்பாணை (Bank Memo) கிடைத்து 10 நாட்கள் ஆகிறது. 15 நாட்களுக்குள் சட்டப்பூர்வ அறிவிப்பு (Legal Notice under Sec 138 NI Act) அனுப்ப வேண்டும். எதிர்பார்த்த நபர் எனது அழைப்புகளை நிராகரிக்கிறார்.",
    intake: {
      workspace: "Citizen360",
      subWorkspace: "Legal360",
      module: "Criminal360",
      engine: "NoticeComplaintAI",
      clientName: "சுந்தரம் கார்த்திக்",
      mobile: "9840112233",
      surveyNumber: "N/A",
      village: "அண்ணா நகர்",
      taluk: "அம்பத்தூர்",
      district: "Chennai",
      oppositeParty: "பிரகாஷ் கெமிக்கல்ஸ் நிர்வாகி",
      partyRelationship: "கடன் அளித்தவர் / கடன் பெற்ற வணிக கூட்டாளி",
      courtOrForum: "விரைவு நீதிமன்றம் (Fast Track Magistrate Court)",
      existingAdvocate: "No",
      existingCaseNumber: "",
      limitationRisk: "Yes"
    }
  },
  {
    title: "கோவை நிறுவனம் சட்டவிரோத பணிநீக்கம் (Labour360)",
    description: "முன்னறிவிப்பின்றி 8 வருட அனுபவம் கொண்ட ஊழியரை நிறுவனம் பணிநீக்கம் செய்து நிலுவைச் சம்பளத்தை வழங்கவில்லை.",
    rawDescription: "நான் கோவையில் உள்ள ஒரு ஐடி/மென்பொருள் நிறுவனத்தில் மூத்த பொறியாளராக 8 ஆண்டுகள் பணிபுரிந்தேன். எந்தவொரு ஒழுங்கு நடவடிக்கை அல்லது காரணமுமின்றி, எனது 3 மாத நிலுவைச் சம்பளம் மற்றும் பிடித்தம் செய்யப்பட்ட வருங்கால வைப்பு நிதி (PF) வழங்கப்படாமல் உடனடியாக பணிநீக்கம் செய்யப்பட்டுள்ளேன். நிறுவனத்தின் மனிதவளத் துறை எனது மின்னஞ்சல்களுக்கு பதிலளிக்கவில்லை.",
    intake: {
      workspace: "Citizen360",
      subWorkspace: "Legal360",
      module: "Labour360",
      engine: "ServiceDeficiencyAI",
      clientName: "திவ்யா சுப்ரமணியம்",
      mobile: "9442233445",
      surveyNumber: "N/A",
      village: "பீளமேடு",
      taluk: "கோவை தெற்கு",
      district: "Coimbatore",
      oppositeParty: "எக்செல் டெக்னாலஜிஸ் பிரைவேட் லிமிடெட்",
      partyRelationship: "நிறுவனம் / ஊழியர் (Employer & Employee)",
      courtOrForum: "தொழிலாளர் நீதிமன்றம் / உதவி தொழிலாளர் ஆணையர்",
      existingAdvocate: "No",
      existingCaseNumber: "",
      limitationRisk: "No"
    }
  },
  {
    title: "திருச்சி நுகர்வோர் காப்பீட்டுத் தொகை நிராகரிப்பு (Consumer360)",
    description: "மருத்துவமனையில் அனுமதிக்கப்பட்ட ரூ. 4.5 லட்சம் மருத்துவக் காப்பீட்டுத் கோரிக்கையை நிறுவனம் காரணம் இல்லாமல் நிராகரித்தது.",
    rawDescription: "எனது தந்தைக்கு அவசர இதய அறுவை சிகிச்சைக்காக ரூ. 4,50,000 செலவானது. எங்களிடம் 10 ஆண்டுகளாக தொடர்ந்து புதுப்பிக்கப்பட்ட ரூ. 5 லட்சம் மதிப்பிலான குடும்ப மருத்துவக் காப்பீடு கொள்கை உள்ளது. ஆனால் காப்பீட்டு நிறுவனம் 'முந்தைய நோய் ஒளிப்பு' (Pre-existing condition) என்று தவறாகக் கூறி கோரிக்கையை முழுமையாக நிராகரித்துவிட்டது. மருத்துவமனை சான்றிதழ் நோய் புதியது என்பதை உறுதிப்படுத்துகிறது.",
    intake: {
      workspace: "Citizen360",
      subWorkspace: "Legal360",
      module: "Consumer360",
      engine: "CompensationAI",
      clientName: "சரவணன் வேலு",
      mobile: "9789012345",
      surveyNumber: "N/A",
      village: "தில்லை நகர்",
      taluk: "திருச்சி",
      district: "Tiruchirappalli",
      oppositeParty: "ஸ்டார் ஹெல்த் இன்சூரன்ஸ் கம்பெனி",
      partyRelationship: "காப்பீட்டாளர் / வாடிக்கையாளர் (Insurer & Consumer)",
      courtOrForum: "மாவட்ட நுகர்வோர் குறைதீர் ஆணையம் (District Consumer Redressal Commission)",
      existingAdvocate: "No",
      existingCaseNumber: "",
      limitationRisk: "No"
    }
  },
  {
    title: "சென்னை மின்-அங்காடி பழுதுள்ள எலக்ட்ரானிக் பொருள் & உத்தரவாதம் மறுப்பு (Consumer360)",
    description: "ரூ. 85,000 வாங்கப்பட்ட மடிக்கணினி (Laptop) 10 நாட்களில் வேலை செய்யவில்லை, டீலர் மற்றும் தயாரிப்பு நிறுவனம் பணத்தைத் திரும்பத்தர மறுக்கிறது.",
    rawDescription: "கடந்த மாதம் ஆன்லைன் மின்-அங்காடி மூலம் ரூ. 85,000 கொடுத்து புதிய லேப்டாப் வாங்குனேன். வாங்கிய 10 நாட்களிலேயே மதர்போர்டு பழுதாகி கணினி இயங்கவில்லை. 1 ஆண்டு உத்தரவாதம் இருந்தும், சர்வீஸ் சென்டர் 'வாடிக்கையாளர் சேதம்' எனக் கூறி ரூ. 35,000 கட்டணம் கேட்கிறது. டீலர் ரீஃபண்ட் வழங்க மறுக்கிறார். இன்வாய்ஸ், வாரண்டி கார்டு, சர்வீஸ் ரிப்போர்ட் மற்றும் மின்னஞ்சல் உரையாடல்கள் என்னிடம் உள்ளன.",
    intake: {
      workspace: "Citizen360",
      subWorkspace: "Legal360",
      module: "Consumer360",
      engine: "ProductDefectAI",
      clientName: "அனிதா ராமச்சந்திரன்",
      mobile: "9841234567",
      surveyNumber: "N/A",
      village: "வேளச்சேரி",
      taluk: "வேளச்சேரி",
      district: "Chennai",
      oppositeParty: "டெக்நோவா எலக்ட்ரானிக்ஸ் டீலர் & தயாரிப்பு நிறுவனம்",
      partyRelationship: "நுகர்வோர் / டீலர் & தயாரிப்பாளர் (Consumer vs Seller & Manufacturer)",
      courtOrForum: "தென் சென்னை மாவட்ட நுகர்வோர் குறைதீர் ஆணையம் (District Consumer Commission, Chennai South)",
      existingAdvocate: "No",
      existingCaseNumber: "",
      limitationRisk: "No"
    }
  }
];
