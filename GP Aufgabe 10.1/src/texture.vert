#version 140
 
in vec3 inputPosition;
in vec4 inputColor;
in vec2 inputTexCoord;
in vec3 inputNormal;

uniform mat4 projection;
uniform mat4 modelview;
uniform mat4 normalMat;

out vec3 forFragColor;
out vec2 forFragTexCoord;
out vec3 normal;
out vec3 vertPos;

void main(){
    forFragColor = inputColor.rgb;
    forFragTexCoord = inputTexCoord;
    normal = (normalMat * vec4(inputNormal, 0.0)).xyz;

    vec4 vertPos4 = modelview * vec4(inputPosition, 1.0);
    vertPos = vec3(vertPos4) / vertPos4.w;
    gl_Position =  projection * modelview * vec4(inputPosition, 1.0);
}
