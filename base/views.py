from django.shortcuts import render
from agora_token_builder import RtcTokenBuilder
from django.http import JsonResponse
import random
import time
import json
from .models import RoomMember
from django.views.decorators.csrf import csrf_exempt
def getToken(request):
    #Build token with uid
    appId='68311faac5b5497bb2e7dbcf3b232b9f'
    appCertificate='ea39f9a3f94749fcaa5c072ba4f2a935'
    channelName=request.GET.get('channel')
    uid=random.randint(1,230)
    expirationTimeInSeconds=3600*24
    currentTimeStamp=time.time()
    privilegeExpiredTs=currentTimeStamp+expirationTimeInSeconds
    role=1
    token = RtcTokenBuilder.buildTokenWithUid(appId, appCertificate, channelName, uid, role, privilegeExpiredTs)
    return JsonResponse({'token':token,'uid':uid},safe=False)

def looby(request):
    return render(request,'base/lobby.html')

def room(request):
    return render(request,'base/room.html')


@csrf_exempt
def createUser(request):
    data=json.loads(request.body)
    member,created=RoomMember.object.get_or_create(
        name=data['name'],
        uid=data['UID'],
        room_name=data['room_name']
    )
    return JsonResponse({'name':data['name']},safe=False)


def getMember(request):
    uid=request.GET.git('uid')
    room_name=request.GET.get('room_name')

    member=RoomMember.objects.get(
        uid=uid,
        room_name=room_name,

    )
    name=member.name
    return JsonResponse({'name':member.name},safe=False)

@csrf_exempt
def deletemember(request):
    data=json.loads(request.body)
    member=RoomMember.objects.get(
        name=data['name'],
        uid=data['uid'],
        room_name=data['room_name']
    )
    member.delete()
    return JsonResponse('Member was deleted',safe=False)