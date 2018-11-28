int led = 13;

int led1R = 10;
int led1G = 9;
int led1B = 8;

int rVal = 0;
int gVal = 0;
int bVal = 0;

void setup(){
  pinMode(led, OUTPUT);
  pinMode(A0, OUTPUT);
  pinMode(A1, OUTPUT);
  pinMode(A2, OUTPUT);
  
  Serial.begin(9600);
  Serial.println("hello curd");
}

void loop(){
  String msg;
  
  
  if (Serial.available()>0){
    msg = Serial.readString();
    Serial.println(" ");
    Serial.println(msg);
    //Serial.println(msg.length());
    
    if (msg.startsWith("r")){
      String red = msg.substring(msg.indexOf("r")+1, msg.indexOf("g"));
      rVal = red.toInt();
      Serial.print("red value: ");
      Serial.println(red);
      
      String gre = msg.substring(msg.indexOf("g")+1, msg.indexOf("b"));
      gVal = gre.toInt();
      Serial.print("green value: ");
      Serial.println(gre);
      
      String blu = msg.substring(msg.indexOf("b")+1);
      bVal = blu.toInt();
      Serial.print("blue value: ");
      Serial.println(blu);
      
      digitalWrite(led, HIGH);
      delay(100);
      digitalWrite(led, LOW);
      
      setLed(rVal,gVal,bVal);
      
      /*rVal = 0;
      rVal*/
    }
  }
}

void setLed(int r, int g, int b){
  
    analogWrite(A0, r);
    analogWrite(A1, g);
    analogWrite(A2, b);

    delay(3000);
    analogWrite(A0, 0);
    analogWrite(A1, 0);
    analogWrite(A2, 0);
    
}
/*
int getValue(String msg,int ind){
  // toInt()
  //string.substring(from, to)
  int commas[] = {-1,-1,-1}; 
  int comma1 = -1;
  int comma2 = -1;
  int comma3 = -1;
  
  // get comma indexes
  for (int i =1; i<msg.length(); i++){
    if (msg[i] == ','){
      commas = push(commas, msg[i].toInt() )
    }
  }
  
  if (ind == 0){
    // get first comma
    int comma1 = msg.indexOf(',');
    String red = msg.substring(comma1);
    
  } else if (ind == 1){
  } else if (ind == 2){
  };
  return 2; 
}
*/
