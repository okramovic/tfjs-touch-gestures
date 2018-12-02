int led = 13;

int led1R = 10;
int led1G = 9;
int led1B = 8;

int rVal = 0;
int gVal = 0;
int bVal = 0;

void setup(){
  pinMode(led, OUTPUT);
  //pinMode(led1R, OUTPUT); // not needed acorrdin to docs
  //pinMode(led1G, OUTPUT);
  //pinMode(led1B, OUTPUT);
  
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
      String red = msg.substring(msg.lastIndexOf("r")+1, msg.lastIndexOf("g"));
      rVal = red.toInt();
      Serial.print("red value: ");
      Serial.println(red);
      
      String gre = msg.substring(msg.lastIndexOf("g")+1, msg.lastIndexOf("b"));
      gVal = gre.toInt();
      Serial.print("green value: ");
      Serial.println(gre);
      
      String blu = msg.substring(msg.lastIndexOf("b")+1);
      bVal = blu.toInt();
      Serial.print("blue value: ");
      Serial.println(blu);
      
      digitalWrite(led, HIGH);
      delay(100);
      digitalWrite(led, LOW);
      
      setLed(rVal,gVal,bVal);
    }
  }
}

void setLed(int r, int g, int b){
  
    analogWrite(led1R, r);
    analogWrite(led1G, g);
    analogWrite(led1B, b*0.66);// blue is brighter than others
    
    analogWrite(7, r);
    analogWrite(6, g);
    analogWrite(5, b*0.66);
    
    analogWrite(4, r);
    analogWrite(3, g);
    analogWrite(2, b*0.66);
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
