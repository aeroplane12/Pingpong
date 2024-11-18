#version 140
out vec4 outputColor;

in vec2 forFragTexCoord;
in vec3 normal;
in vec3 vertPos;
in vec3 forFragColor;

uniform sampler2D myTexture;
uniform vec3 lightDirection;
uniform bool shading;

const vec4 lightColor = vec4(1.0, 1.0, 1.0, 1.0);
const vec3 ambientLight = vec3(0.1, 0.1, 0.1);
const vec3 specularColor = vec3(0.3, 0.3, 0.3);
// specular shininess exponent
const float shininess = 20f;
const float illumiPerp = 1f;

vec3 phongBRDF(in vec3 lightDir, in vec3 viewDir, in vec3 normal, in
vec3 phongDiffuseCol, in vec3 phongSpecularCol, float phongShininess) {
    vec3 color = phongDiffuseCol;
    vec3 reflectDir = reflect(-lightDir, normal);
    float specDot = max(dot(reflectDir, viewDir), 0.0);
    color += pow(specDot, phongShininess) * phongSpecularCol;
    return color;
}

void main() {
    vec3 n = normalize(normal.xyz);
    vec3 lightDir = normalize(-lightDirection);
    vec3 viewDir = normalize(-vertPos);

    vec3 textureColor = vec3(texture(myTexture, forFragTexCoord));
    vec3 diffuseColor =  vec3(forFragColor * textureColor);
    vec3 luminance = ambientLight * diffuseColor;

    // illuminance  contribution from light
    float illuminance = max(dot(lightDir, n), 0.0) * illumiPerp;
    if (illuminance >= 0.0) { // if receives light
        vec3 brdf = phongBRDF(lightDir, viewDir, n, diffuseColor,
        specularColor.rgb, shininess);
        luminance += brdf * illuminance * lightColor.rgb;
    }

    if (shading) {
        outputColor = vec4(luminance, 1.0);
    } else {
        outputColor = vec4(diffuseColor, 1.0);
    }
}