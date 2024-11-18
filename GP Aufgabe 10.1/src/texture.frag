#version 140
out vec4 outputColor;

in vec2 forFragTexCoord;
in vec3 normal;
in vec3 vertPos;
in vec3 forFragColor;

uniform sampler2D myTexture;
uniform vec3 lightDirection;
uniform int shading;

const vec4 lightColor = vec4(1.0, 1.0, 1.0, 1.0);
const vec3 ambientLight = vec3(0.1, 0.1, 0.1);
const vec3 specularColor = vec3(0.3, 0.3, 0.3);
// specular shininess exponent
const float shininess = 20.0;
const float illumiPerp = 1.0;

#define PI 3.1415926535 // Aufgabe 1

vec3 phongBRDF(in vec3 lightDir, in vec3 viewDir, in vec3 normal, in vec3 phongDiffuseCol, in vec3 phongSpecularCol, float phongShininess) {
    vec3 color = phongDiffuseCol;
    vec3 reflectDir = reflect(-lightDir, normal);
    float specDot = max(dot(reflectDir, viewDir), 0.0);
    color += pow(specDot, phongShininess) * phongSpecularCol;
    return color;
}

vec3 blinnPhongBRDF(vec3 lightDir, vec3 viewDir, vec3 normal, vec3 phongDiffuseCol, vec3 phongSpecularCol, float phongShininess) { // Aufgabe 1
    vec3 color = phongDiffuseCol;
    vec3 halfDir = normalize(viewDir + lightDir);
    float specDot = max(dot(halfDir, normal), 0.0);
    color += pow(specDot, phongShininess) * phongSpecularCol;
    return color;
}

vec3 fresnelSchlick(float cosTheta, vec3 F0) { // Aufgabe 1
    return F0 + (1.0 - F0) * pow(1.0 - cosTheta, 5.0);
}

float D_GGX(float NoH, float roughness) { // Aufgabe 1
    float alpha = roughness * roughness;
    float alpha2 = alpha * alpha;
    float NoH2 = NoH * NoH;
    float b = (NoH2 * (alpha2 - 1.0) + 1.0);
    return alpha2 / (PI * b * b);
}

float G1_GGX_Schlick(float NdotV, float roughness) { // Aufgabe 1
    float r = 0.5 + 0.5 * roughness;
    float k = (r * r) / 2.0;
    float denom = NdotV * (1.0 - k) + k;
    return NdotV / denom;
}

float G_Smith(float NoV, float NoL, float roughness) { // Aufgabe 1
    float g1_l = G1_GGX_Schlick(NoL, roughness);
    float g1_v = G1_GGX_Schlick(NoV, roughness);
    return g1_l * g1_v;
}

vec3 microfacetBRDF(in vec3 L, in vec3 V, in vec3 N,
in vec3 baseColor, in float metallicness,
in float fresnelReflect, in float roughness) { // Aufgabe 1

    vec3 H = normalize(V + L);

    float NoV = clamp(dot(N, V), 0.0, 1.0);
    float NoL = clamp(dot(N, L), 0.0, 1.0);
    float NoH = clamp(dot(N, H), 0.0, 1.0);
    float VoH = clamp(dot(V, H), 0.0, 1.0);

    vec3 f0 = vec3(0.16 * (fresnelReflect * fresnelReflect));

    f0 = mix(f0, baseColor, metallicness);

    vec3 F = fresnelSchlick(VoH, f0);
    float D = D_GGX(NoH, roughness);
    float G = G_Smith(NoV, NoL, roughness);
    vec3 spec = (D * G * F) / max(4.0 * NoV * NoL, 0.001);

    vec3 rhoD = vec3(1.0) - F;
    rhoD *= 1.0 - metallicness;
    vec3 diff = rhoD * baseColor / PI;

    return diff + spec;
}

vec3 toonBRDF(vec3 lightDir, vec3 viewDir, vec3 normal, vec3 phongDiffuseCol, vec3 phongSpecularCol, float phongShininess) { // Aufgabe 1
    vec3 color = phongDiffuseCol;
    vec3 halfDir = normalize(viewDir + lightDir);
    float specDot = max(dot(halfDir, normal), 0.0);
    color += pow(specDot, phongShininess)>0.9?phongSpecularCol:vec3(0,0,0);
    return color;
}
void main() {
    vec3 n = normalize(normal.xyz);
    vec3 lightDir = normalize(-lightDirection);
    vec3 viewDir = normalize(-vertPos);

    vec3 textureColor = vec3(texture(myTexture, forFragTexCoord));
    vec3 diffuseColor =  vec3(forFragColor * textureColor);
    vec3 luminance = ambientLight * diffuseColor;

    if (shading == 0) // Aufgabe 1
    {
        outputColor = vec4(diffuseColor,0.0); // Aufgabe 1
    }
    else // Aufgabe 1
    {

        // illuminance  contribution from light
        float illuminance = max(dot(lightDir, n), 0.0) * illumiPerp;
        if (illuminance >= 0.0)  // if receives light
        {
            vec3 brdf = vec3(0,0,0); // Aufgabe 1
            if (shading == 1) {
                brdf = phongBRDF(lightDir, viewDir, n, diffuseColor, specularColor.rgb, shininess);
            } else if (shading == 2) {
                brdf = blinnPhongBRDF(lightDir, viewDir, n, diffuseColor, specularColor.rgb, shininess);
            } else if (shading == 3) {
                illuminance *= PI;
                brdf = microfacetBRDF(lightDir, viewDir, n, diffuseColor, 0.0, 0.5, 0.5);
            } else if (shading == 4) {
                illuminance = round(illuminance * 4) / 4.0;
                brdf = toonBRDF(lightDir, viewDir, n, diffuseColor, specularColor.rgb, shininess);
            }

            luminance += brdf * illuminance * lightColor.rgb;
        }
        outputColor = vec4(luminance, 1.0);
    }
}